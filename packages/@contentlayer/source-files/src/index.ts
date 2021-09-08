import * as core from '@contentlayer/core'
import * as utils from '@contentlayer/utils'
import { effectUtils } from '@contentlayer/utils'
import { FSWatch } from '@contentlayer/utils/node'
import { pipe } from '@effect-ts/core'
import * as T from '@effect-ts/core/Effect'
import * as S from '@effect-ts/core/Effect/Stream'
import type * as OT from '@effect-ts/otel'

import type { FetchDataError } from './errors'
import { fetchAllDocuments, makeCacheItemFromFilePathEff } from './fetchData'
import { makeCoreSchema } from './provideSchema'
import type { DocumentType, Thunk } from './schema'
import type { FilePathPatternMap, PluginOptions } from './types'

export * from './types'
export * from './schema'

type Args = {
  documentTypes: DocumentType[] | Record<string, DocumentType>
  /**
   * Path to the root directory that contains all content. Every content file path will be relative
   * to this directory. This includes:
   *  - `filePathPattern` is relative to `contentDirPath`
   *  - `_raw` fields such as `flattenedPath`, `sourceFilePath`, `sourceFileDir`
   */
  contentDirPath: string
  extensions?: {
    stackbit?: core.StackbitExtension.Config
  }
} & PluginOptions &
  Partial<Flags>

export type Flags = {
  /**
   * Whether to skip, fail or ignore when encountering document files which can't be mapped
   * to a document type.
   *
   * @default 'skip-warn'
   */
  onUnknownDocuments: 'skip-warn' | 'skip-ignore' | 'fail'

  /**
   * Whether to print warning meassages if a document has field values
   * which are not definied in the document definition
   *
   * @default 'warn'
   */
  onExtraFieldData: 'warn' | 'ignore' | 'fail'

  /**
   * Whether to skip, fail or ignore when encountering missing or incompatible data
   *
   * @default 'skip-warn'
   */
  onMissingOrIncompatibleData: 'skip-warn' | 'skip-ignore' | 'fail'
}

type MakeSourcePlugin = (_: Args | Thunk<Args> | Thunk<Promise<Args>>) => Promise<core.SourcePlugin>

export const makeSource: MakeSourcePlugin = async (argsOrArgsThunk) => {
  const {
    contentDirPath,
    documentTypes,
    onUnknownDocuments = 'skip-warn',
    onMissingOrIncompatibleData = 'skip-warn',
    onExtraFieldData = 'warn',
    extensions,
    ...pluginOptions
  } = typeof argsOrArgsThunk === 'function' ? await argsOrArgsThunk() : argsOrArgsThunk

  const documentTypeDefs = (Array.isArray(documentTypes) ? documentTypes : Object.values(documentTypes)).map((_) =>
    _.def(),
  )
  const schemaDef = { documentTypeDefs }

  const options = {
    markdown: pluginOptions.markdown,
    mdx: pluginOptions.mdx,
    fieldOptions: {
      bodyFieldName: pluginOptions.fieldOptions?.bodyFieldName ?? 'body',
      typeFieldName: pluginOptions.fieldOptions?.typeFieldName ?? 'type',
    },
  }

  const fetchDataEff: core.FetchDataEff = () => {
    const filePathPatternMap: FilePathPatternMap = Object.fromEntries(
      documentTypeDefs
        .filter((_) => _.filePathPattern)
        .map((documentDef) => [documentDef.filePathPattern, documentDef.name]),
    )
    const flags: Flags = { onUnknownDocuments, onExtraFieldData, onMissingOrIncompatibleData }

    const coreSchemaDef = makeCoreSchema({ schemaDef, options })
    const initEvent: CustomUpdateEventInit = { _tag: 'init' }

    let cache: core.Cache | undefined = undefined

    const updateStream = pipe(
      FSWatch.makeAndSubscribe('.', {
        cwd: contentDirPath,
        ignoreInitial: true,
        // Unfortunately needed in order to avoid race conditions
        awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 10 },
      }),
      S.map(chokidarAllEventToCustomUpdateEvent),
      S.tap((e) =>
        T.succeedWith(
          () =>
            (e._tag === 'update' || e._tag === 'deleted') &&
            console.log(`Watch event "${e._tag}": ${e.relativeFilePath}`),
        ),
      ),
      effectUtils.streamStartWith(initEvent),
    )

    return pipe(
      updateStream,
      S.tap(() =>
        pipe(
          core.loadPreviousCacheFromDiskEff({ schemaHash: coreSchemaDef.hash }),
          T.tap((_cache) => T.succeedWith(() => (cache = _cache))),
        ),
      ),
      S.mapM((event) => {
        switch (event._tag) {
          case 'init':
            return fetchAllDocuments({
              coreSchemaDef,
              filePathPatternMap,
              contentDirPath,
              flags,
              options,
              previousCache: cache,
            })
          case 'deleted': {
            return T.succeedWith(() => {
              delete cache!.cacheItemsMap[event.relativeFilePath]
              return cache!
            })
          }
          case 'update': {
            return updateCacheEntry({
              contentDirPath,
              filePathPatternMap,
              cache: cache!,
              event,
              flags,
              coreSchemaDef,
              options,
            })
          }
          default:
            utils.casesHandled(event)
        }
      }),
      // update local and persisted cache
      S.tap((cache_) =>
        T.tryCatchPromise(
          async () => {
            cache = cache_
            await core.writeCacheToDisk({ cache, schemaHash: coreSchemaDef.hash })
          },
          (e) => e as Error,
        ),
      ),
    )
  }

  return {
    type: 'local',
    extensions: extensions ?? {},
    options,
    provideSchema: () => makeCoreSchema({ schemaDef, options }),
    provideSchemaEff: T.succeedWith(() => makeCoreSchema({ schemaDef, options })),
    fetchData: null as any,
    fetchDataEff,
  }
}

const updateCacheEntry = ({
  contentDirPath,
  filePathPatternMap,
  cache,
  event,
  flags,
  coreSchemaDef,
  options,
}: {
  contentDirPath: string
  filePathPatternMap: FilePathPatternMap
  cache: core.Cache
  event: CustomUpdateEventFileUpdated
  flags: Flags
  coreSchemaDef: core.SchemaDef
  options: core.PluginOptions
}): T.Effect<OT.HasTracer, FetchDataError, core.Cache> =>
  T.gen(function* ($) {
    const cacheItem = yield* $(
      makeCacheItemFromFilePathEff({
        relativeFilePath: event.relativeFilePath,
        contentDirPath,
        filePathPatternMap,
        flags,
        coreSchemaDef,
        options,
        previousCache: cache,
      }),
    )

    if (cacheItem) {
      cache!.cacheItemsMap[event.relativeFilePath] = cacheItem
    }

    return cache
  })

const chokidarAllEventToCustomUpdateEvent = (event: FSWatch.FileSystemEvent): CustomUpdateEvent => {
  switch (event._tag) {
    case 'FileAdded':
    case 'FileChanged':
      return { _tag: 'update', relativeFilePath: event.path }
    case 'FileRemoved':
      return { _tag: 'deleted', relativeFilePath: event.path }
    case 'DirectoryRemoved':
    case 'DirectoryAdded':
      return { _tag: 'init' }
    default:
      utils.casesHandled(event)
  }
}

type CustomUpdateEvent = CustomUpdateEventFileUpdated | CustomUpdateEventFileDeleted | CustomUpdateEventInit

type CustomUpdateEventFileUpdated = {
  readonly _tag: 'update'
  relativeFilePath: string
}

type CustomUpdateEventFileDeleted = {
  readonly _tag: 'deleted'
  relativeFilePath: string
}

type CustomUpdateEventInit = {
  readonly _tag: 'init'
}
