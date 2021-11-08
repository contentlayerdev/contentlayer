import * as core from '@contentlayer/core'
import * as utils from '@contentlayer/utils'
import type { E, OT } from '@contentlayer/utils/effect'
import { pipe, S, T, These } from '@contentlayer/utils/effect'
import { FSWatch } from '@contentlayer/utils/node'

import { FetchDataError } from '../errors/index.js'
import type * as LocalSchema from '../schema/defs/index.js'
import type { FilePathPatternMap, Flags } from '../types.js'
import { fetchAllDocuments, makeCacheItemFromFilePath } from './fetchAllDocuments.js'

export const fetchData = ({
  coreSchemaDef,
  documentTypeDefs,
  flags,
  options,
  contentDirPath,
  verbose,
  cwd,
}: {
  coreSchemaDef: core.SchemaDef
  documentTypeDefs: LocalSchema.DocumentTypeDef[]
  flags: Flags
  options: core.PluginOptions
  contentDirPath: string
  verbose: boolean
  cwd: string
}): S.Stream<OT.HasTracer, never, E.Either<core.SourceFetchDataError, core.DataCache.Cache>> => {
  const filePathPatternMap: FilePathPatternMap = Object.fromEntries(
    documentTypeDefs
      .filter((_) => _.filePathPattern)
      .map((documentDef) => [documentDef.filePathPattern, documentDef.name]),
  )

  const initEvent: CustomUpdateEventInit = { _tag: 'init' }

  const fileUpdatesStream = pipe(
    FSWatch.makeAndSubscribe('.', {
      cwd: contentDirPath,
      ignoreInitial: true,
      // Unfortunately needed in order to avoid race conditions
      awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 10 },
    }),
    S.mapEitherRight(chokidarAllEventToCustomUpdateEvent),
  )

  const resolveParams = pipe(
    core.DataCache.loadPreviousCacheFromDisk({ schemaHash: coreSchemaDef.hash, cwd }),
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
                  flags,
                  options,
                  previousCache: cache,
                  verbose,
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
                }),
            }),
            T.either,
          ),
        ),
        // update local and persisted cache
        S.tapRight((cache_) => T.succeedWith(() => (cache = cache_))),
        S.tapRightEither((cache_) =>
          core.DataCache.writeCacheToDisk({ cache: cache_, schemaHash: coreSchemaDef.hash, cwd }),
        ),
      ),
    ),
    S.mapEitherLeft(
      (error) => new core.SourceFetchDataError({ error, alreadyHandled: error._tag === 'HandledFetchDataError' }),
    ),
  )
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
  cache: core.DataCache.Cache
  event: CustomUpdateEventFileUpdated
  flags: Flags
  coreSchemaDef: core.SchemaDef
  options: core.PluginOptions
}): T.Effect<OT.HasTracer, core.HandledFetchDataError, core.DataCache.Cache> =>
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
        }),
        These.effectTapSuccess((cacheItem) =>
          T.succeedWith(() => {
            cache!.cacheItemsMap[event.relativeFilePath] = cacheItem
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
      return { _tag: 'updated', relativeFilePath: event.path }
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
  readonly _tag: 'updated'
  relativeFilePath: string
}

type CustomUpdateEventFileDeleted = {
  readonly _tag: 'deleted'
  relativeFilePath: string
}

type CustomUpdateEventInit = {
  readonly _tag: 'init'
}
