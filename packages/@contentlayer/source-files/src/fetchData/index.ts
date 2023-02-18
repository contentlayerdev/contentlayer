import type { HasCwd } from '@contentlayer/core'
import * as core from '@contentlayer/core'
import type { AbsolutePosixFilePath, fs, RelativePosixFilePath } from '@contentlayer/utils'
import * as utils from '@contentlayer/utils'
import { unknownToRelativePosixFilePath } from '@contentlayer/utils'
import type { E, HasConsole, OT } from '@contentlayer/utils/effect'
import { pipe, S, T, These } from '@contentlayer/utils/effect'
import { FSWatch } from '@contentlayer/utils/node'

import { FetchDataError } from '../errors/index.js'
import type * as LocalSchema from '../schema/defs/index.js'
import type { ContentTypeMap, FilePathPatternMap, Flags } from '../types.js'
import { provideDocumentTypeMapState } from './DocumentTypeMap.js'
import { fetchAllDocuments } from './fetchAllDocuments.js'
import { makeCacheItemFromFilePath } from './makeCacheItemFromFilePath.js'

export const fetchData = ({
  coreSchemaDef,
  documentTypeDefs,
  flags,
  options,
  contentDirPath,
  contentDirInclude,
  contentDirExclude,
  skipCachePersistence = false,
  verbose,
}: {
  coreSchemaDef: core.SchemaDef
  documentTypeDefs: LocalSchema.DocumentTypeDef[]
  flags: Flags
  options: core.PluginOptions
  contentDirPath: AbsolutePosixFilePath
  contentDirInclude: readonly RelativePosixFilePath[]
  contentDirExclude: readonly RelativePosixFilePath[]
  /**
   * For example for dynamic content builds, we'd like to do as much as possible in-memory
   * and thus want to skip persisted caching
   */
  skipCachePersistence?: boolean
  verbose: boolean
}): S.Stream<
  OT.HasTracer & HasCwd & HasConsole & fs.HasFs,
  never,
  E.Either<core.SourceFetchDataError, core.DataCache.Cache>
> => {
  const filePathPatternMap = makefilePathPatternMap(documentTypeDefs)
  const contentTypeMap = makeContentTypeMap(documentTypeDefs)

  const initEvent: CustomUpdateEventInit = { _tag: 'init' }

  const watchPaths = contentDirInclude.length > 0 ? contentDirInclude : ['.']

  const fileUpdatesStream = pipe(
    FSWatch.makeAndSubscribe(watchPaths, {
      cwd: contentDirPath,
      ignoreInitial: true,
      ignored: contentDirExclude as unknown as string[], // NOTE type cast needed because of readonly array
      // Unfortunately needed in order to avoid race conditions
      awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 10 },
    }),
    S.mapEitherRight(chokidarAllEventToCustomUpdateEvent),
  )

  const resolveParams = pipe(
    skipCachePersistence
      ? T.succeed(undefined)
      : core.DataCache.loadPreviousCacheFromDisk({ schemaHash: coreSchemaDef.hash }),
    T.either,
  )

  return pipe(
    S.fromEffect(resolveParams),
    S.chainSwitchMapEitherRight((cache) =>
      pipe(
        fileUpdatesStream,
        S.tapRight((e) =>
          T.succeedWith(
            () =>
              (e._tag === 'updated' || e._tag === 'deleted') && console.log(`\nFile ${e._tag}: ${e.relativeFilePath}`),
          ),
        ),
        S.startWithRight(initEvent),
        S.mapEffectEitherRight((event) =>
          pipe(
            event,
            T.matchTag({
              init: () =>
                fetchAllDocuments({
                  coreSchemaDef,
                  filePathPatternMap,
                  contentDirPath,
                  contentDirInclude,
                  contentDirExclude,
                  flags,
                  options,
                  previousCache: cache,
                  verbose,
                  contentTypeMap,
                }),
              deleted: (event) =>
                T.succeedWith(() => {
                  delete cache!.cacheItemsMap[event.relativeFilePath]
                  return cache!
                }),
              updated: (event) =>
                updateCacheEntry({
                  contentDirPath,
                  filePathPatternMap,
                  cache: cache!,
                  event,
                  flags,
                  coreSchemaDef,
                  options,
                  contentTypeMap,
                }),
            }),
            T.either,
          ),
        ),
        // update local and persisted cache
        S.tapRight((cache_) => T.succeedWith(() => (cache = cache_))),
        S.tapRightEither((cache_) =>
          skipCachePersistence
            ? (T.unit as never)
            : core.DataCache.writeCacheToDisk({ cache: cache_, schemaHash: coreSchemaDef.hash }),
        ),
      ),
    ),
    S.mapEitherRight((cache) => embedReferences({ cache, coreSchemaDef })),
    S.mapEitherLeft(
      (error) => new core.SourceFetchDataError({ error, alreadyHandled: error._tag === 'HandledFetchDataError' }),
    ),
  )
}

const makefilePathPatternMap = (documentTypeDefs: LocalSchema.DocumentTypeDef[]): FilePathPatternMap =>
  Object.fromEntries(
    documentTypeDefs
      .filter((_) => _.filePathPattern)
      .map((documentDef) => [documentDef.filePathPattern, documentDef.name]),
  )

export const testOnly_makefilePathPatternMap = makefilePathPatternMap

const makeContentTypeMap = (documentTypeDefs: LocalSchema.DocumentTypeDef[]): ContentTypeMap =>
  Object.fromEntries(
    documentTypeDefs.filter((_) => _.filePathPattern).map((documentDef) => [documentDef.name, documentDef.contentType]),
  )

export const testOnly_makeContentTypeMap = makeContentTypeMap

const updateCacheEntry = ({
  contentDirPath,
  filePathPatternMap,
  cache,
  event,
  flags,
  coreSchemaDef,
  options,
  contentTypeMap,
}: {
  contentDirPath: AbsolutePosixFilePath
  filePathPatternMap: FilePathPatternMap
  cache: core.DataCache.Cache
  event: CustomUpdateEventFileUpdated
  flags: Flags
  coreSchemaDef: core.SchemaDef
  options: core.PluginOptions
  contentTypeMap: ContentTypeMap
}): T.Effect<OT.HasTracer & HasConsole & HasCwd & fs.HasFs, core.HandledFetchDataError, core.DataCache.Cache> =>
  T.gen(function* ($) {
    yield* $(
      pipe(
        makeCacheItemFromFilePath({
          relativeFilePath: event.relativeFilePath,
          contentDirPath,
          filePathPatternMap,
          coreSchemaDef,
          options,
          previousCache: cache,
          contentTypeMap,
        }),
        // NOTE in this code path the DocumentTypeMapState is not used
        provideDocumentTypeMapState,
        These.effectTapSuccess((cacheItem) =>
          T.succeedWith(() => {
            cache.cacheItemsMap[event.relativeFilePath] = cacheItem
          }),
        ),
        These.effectTapErrorOrWarning((errorOrWarning) =>
          FetchDataError.handleErrors({
            errors: [errorOrWarning],
            documentCount: 1,
            flags,
            options,
            schemaDef: coreSchemaDef,
            verbose: false,
            contentDirPath,
          }),
        ),
      ),
    )

    return cache
  })

const chokidarAllEventToCustomUpdateEvent = (event: FSWatch.FileSystemEvent): CustomUpdateEvent => {
  switch (event._tag) {
    case 'FileAdded':
    case 'FileChanged':
      return { _tag: 'updated', relativeFilePath: unknownToRelativePosixFilePath(event.path) }
    case 'FileRemoved':
      return { _tag: 'deleted', relativeFilePath: unknownToRelativePosixFilePath(event.path) }
    case 'DirectoryRemoved':
    case 'DirectoryAdded':
      return { _tag: 'init' }
    default:
      utils.casesHandled(event)
  }
}

type CustomUpdateEvent = CustomUpdateEventFileUpdated | CustomUpdateEventFileDeleted | CustomUpdateEventInit

type CustomUpdateEventFileUpdated = {
  readonly _tag: 'updated'
  relativeFilePath: RelativePosixFilePath
}

type CustomUpdateEventFileDeleted = {
  readonly _tag: 'deleted'
  relativeFilePath: RelativePosixFilePath
}

type CustomUpdateEventInit = {
  readonly _tag: 'init'
}

// TODO come up with better implementation for this that has correct and incremental caching behavior
// TODO make this work for deep nested references
const embedReferences = ({ cache, coreSchemaDef }: { cache: core.DataCache.Cache; coreSchemaDef: core.SchemaDef }) => {
  const documentDefs = Object.values(coreSchemaDef.documentTypeDefMap)
  const nestedDefs = Object.values(coreSchemaDef.nestedTypeDefMap)
  const defs = [...documentDefs, ...nestedDefs]
  const defsWithEmbeddedRefs = defs.filter((_) => _.fieldDefs.some((_) => core.isReferenceField(_) && _.embedDocument))

  const defsWithEmbeddedListRefs = defs.filter((_) =>
    _.fieldDefs.some((_) => core.isListFieldDef(_) && _.of.type === 'reference' && _.of.embedDocument),
  )

  const defNameSetWithEmbeddedRefs = new Set([
    ...defsWithEmbeddedRefs.map((_) => _.name),
    ...defsWithEmbeddedListRefs.map((_) => _.name),
  ])

  if (defsWithEmbeddedRefs.length > 0) {
    for (const cacheItem of Object.values(cache.cacheItemsMap)) {
      // short circuit here
      if (!defNameSetWithEmbeddedRefs.has(cacheItem.documentTypeName)) continue

      const documentDef = coreSchemaDef.documentTypeDefMap[cacheItem.documentTypeName]!
      const fieldDefsWithEmbeddedRefs = documentDef.fieldDefs.filter((_) => core.isReferenceField(_) && _.embedDocument)
      for (const fieldDef of fieldDefsWithEmbeddedRefs) {
        const referenceId = cacheItem.document[fieldDef.name]
        if (referenceId === undefined || referenceId === null) continue

        const referenceAlreadyEmbedded = typeof referenceId !== 'string'
        // TODO take care of case where embedded document was updated in the meantime
        if (referenceAlreadyEmbedded) continue

        const referencedDocument = cache.cacheItemsMap[referenceId]!.document!

        cacheItem.document[fieldDef.name] = referencedDocument
      }

      // const embeddedListItemReferences = documentDef.fieldDefs.filter(core.isListFieldDef)
      const listFieldDefs = documentDef.fieldDefs.filter(core.isListFieldDef)
      // console.log({ listFieldDefs })

      for (const listFieldDef of listFieldDefs) {
        if (core.ListFieldDefItem.isDefItemReference(listFieldDef.of) && listFieldDef.of.embedDocument) {
          const listValues = cacheItem.document[listFieldDef.name]
          if (listValues === undefined || listValues === null || !Array.isArray(listValues)) continue

          for (const [index, listValue] of listValues.entries()) {
            const referenceAlreadyEmbedded = typeof listValue !== 'string'
            if (referenceAlreadyEmbedded) continue

            const referencedDocument = cache.cacheItemsMap[listValue]!.document!
            cacheItem.document[listFieldDef.name][index] = referencedDocument
          }
        }
      }
    }
  }

  return cache
}
