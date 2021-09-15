import * as core from '@contentlayer/core'
import { SourceFetchDataError, writeCacheToDisk } from '@contentlayer/core'
import * as utils from '@contentlayer/utils'
import type { E, OT } from '@contentlayer/utils/effect'
import { pipe, S, T, These } from '@contentlayer/utils/effect'
import * as Node from '@contentlayer/utils/node'

import type { FetchDataError } from '../errors'
import type * as LocalSchema from '../schema/defs'
import type { FilePathPatternMap, Flags } from '../types'
import { fetchAllDocuments, makeCacheItemFromFilePath } from './fetchAllDocuments'

export const fetchData = ({
  coreSchemaDef,
  documentTypeDefs,
  flags,
  options,
  contentDirPath,
  verbose,
}: {
  coreSchemaDef: core.SchemaDef
  documentTypeDefs: LocalSchema.DocumentTypeDef[]
  flags: Flags
  options: core.PluginOptions
  contentDirPath: string
  verbose: boolean
}): S.Stream<OT.HasTracer, never, E.Either<SourceFetchDataError, core.Cache>> => {
  const filePathPatternMap: FilePathPatternMap = Object.fromEntries(
    documentTypeDefs
      .filter((_) => _.filePathPattern)
      .map((documentDef) => [documentDef.filePathPattern, documentDef.name]),
  )

  const initEvent: CustomUpdateEventInit = { _tag: 'init' }

  const updateStream = pipe(
    Node.FSWatch.makeAndSubscribe('.', {
      cwd: contentDirPath,
      ignoreInitial: true,
      // Unfortunately needed in order to avoid race conditions
      awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 10 },
    }),
    S.mapEitherRight(chokidarAllEventToCustomUpdateEvent),
  )

  const resolveParams = pipe(core.loadPreviousCacheFromDisk({ schemaHash: coreSchemaDef.hash }), T.either)

  return pipe(
    S.fromEffect(resolveParams),
    S.chainSwitchMapEitherRight((cache) =>
      pipe(
        updateStream,
        S.tapRight((e) =>
          T.succeedWith(
            () =>
              (e._tag === 'updated' || e._tag === 'deleted') &&
              console.log(`Watch event "${e._tag}": ${e.relativeFilePath}`),
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
        S.tapRightEither((cache_) => writeCacheToDisk({ cache: cache_, schemaHash: coreSchemaDef.hash })),
      ),
    ),
    S.mapEitherLeft((error) => new SourceFetchDataError({ error })),
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
  cache: core.Cache
  event: CustomUpdateEventFileUpdated
  flags: Flags
  coreSchemaDef: core.SchemaDef
  options: core.PluginOptions
}): T.Effect<OT.HasTracer, FetchDataError, core.Cache> =>
  T.gen(function* ($) {
    const cacheItem = yield* $(
      pipe(
        makeCacheItemFromFilePath({
          relativeFilePath: event.relativeFilePath,
          contentDirPath,
          filePathPatternMap,
          flags,
          coreSchemaDef,
          options,
          previousCache: cache,
        }),
        These.effectUnwrapValue,
      ),
    )

    if (cacheItem) {
      cache!.cacheItemsMap[event.relativeFilePath] = cacheItem
    }

    return cache
  })

const chokidarAllEventToCustomUpdateEvent = (event: Node.FSWatch.FileSystemEvent): CustomUpdateEvent => {
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
