import * as core from '@contentlayer/core'
import * as utils from '@contentlayer/utils'
import * as chokidar from 'chokidar'
import type { Observable } from 'rxjs'
import { defer, fromEvent, of } from 'rxjs'
import { map, mergeMap, startWith, tap } from 'rxjs/operators'

import { fetchAllDocuments, makeCacheItemFromFilePath } from './fetchData'
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
   * Whether to print warning meassages if content has fields not definied in the schema
   * @default 'warn'
   */
  onExtraData: 'warn' | 'ignore'
  /**
   * Whether to skip or fail when encountering missing or incompatible data
   */
  onMissingOrIncompatibleData: 'skip' | 'fail' | 'skip-ignore'
}

type MakeSourcePlugin = (_: Args | Thunk<Args> | Thunk<Promise<Args>>) => Promise<core.SourcePlugin>

export const makeSource: MakeSourcePlugin = async (argsOrArgsThunk) => {
  const {
    contentDirPath,
    documentTypes,
    onMissingOrIncompatibleData = 'skip',
    onExtraData = 'warn',
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

  return {
    type: 'local',
    extensions: extensions ?? {},
    options,
    provideSchema: () => makeCoreSchema({ schemaDef, options }),
    fetchData: ({ watch }) => {
      const filePathPatternMap: FilePathPatternMap = Object.fromEntries(
        documentTypeDefs
          .filter((_) => _.filePathPattern)
          .map((documentDef) => [documentDef.filePathPattern, documentDef.name]),
      )
      const flags: Flags = { onExtraData, onMissingOrIncompatibleData }

      const coreSchemaDef = makeCoreSchema({ schemaDef, options })
      const initEvent: CustomUpdateEventInit = { _tag: 'init' }

      let cache: core.Cache | undefined = undefined

      const updates$: Observable<CustomUpdateEvent> = watch
        ? defer(
            () =>
              fromEvent(
                chokidar.watch('.', {
                  cwd: contentDirPath,
                  ignoreInitial: true,
                  // Unfortunately needed in order to avoid race conditions
                  awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 10 },
                }),
                'all',
              ) as Observable<ChokidarAllEvent>,
          ).pipe(
            map(chokidarAllEventToCustomUpdateEvent),
            tap(
              (e) =>
                (e._tag === 'update' || e._tag === 'deleted') &&
                console.log(`Watch event "${e._tag}": ${e.relativeFilePath}`),
            ),
            startWith(initEvent),
          )
        : of(initEvent)

      return (
        updates$
          .pipe(
            // init cache from persisted cache
            mergeMap(async (event) => {
              if (!cache) {
                cache = await core.loadPreviousCacheFromDisk({ schemaHash: coreSchemaDef.hash })
              }
              return event
            }),
            mergeMap(async (event) => {
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
                  delete cache!.cacheItemsMap[event.relativeFilePath]
                  return cache!
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
          )
          // update local and persisted cache
          .pipe(
            tap(async (cache_) => {
              cache = cache_
              await core.writeCacheToDisk({ cache, schemaHash: coreSchemaDef.hash })
            }),
          )
      )
    },
  }
}

const updateCacheEntry = async ({
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
}): Promise<core.Cache> => {
  const cacheItem = await makeCacheItemFromFilePath({
    relativeFilePath: event.relativeFilePath,
    contentDirPath,
    filePathPatternMap,
    flags,
    coreSchemaDef,
    options,
    previousCache: cache,
  })

  if (cacheItem) {
    cache!.cacheItemsMap[event.relativeFilePath] = cacheItem
  }

  return cache
}

const chokidarAllEventToCustomUpdateEvent = ([eventName, relativeFilePath]: ChokidarAllEvent): CustomUpdateEvent => {
  switch (eventName) {
    case 'add':
    case 'change':
      return { _tag: 'update', relativeFilePath }
    case 'unlink':
      return { _tag: 'deleted', relativeFilePath }
    case 'unlinkDir':
    case 'addDir':
      return { _tag: 'init' }
    default:
      utils.casesHandled(eventName)
  }
}

type ChokidarAllEvent = [eventName: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir', path: string, stats?: any]

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
