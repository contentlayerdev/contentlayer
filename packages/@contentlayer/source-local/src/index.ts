import type { Cache, Options, SchemaDef, SourcePlugin, StackbitExtension } from '@contentlayer/core'
import { loadPreviousCacheFromDisk, writeCacheToDisk } from '@contentlayer/core'
import { casesHandled } from '@contentlayer/utils'
import * as chokidar from 'chokidar'
import type { Observable } from 'rxjs'
import { defer, fromEvent, of } from 'rxjs'
import { map, mergeMap, startWith, tap } from 'rxjs/operators'

import { fetchAllDocuments, getDocumentDefNameWithRelativeFilePathArray, makeCacheItemFromFilePath } from './fetchData'
import { makeCoreSchema } from './provideSchema'
import type { DocumentType, Thunk } from './schema'
import type { FilePathPatternMap } from './types'

export * from './types'

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
    stackbit?: StackbitExtension.Config
  }
} & Options &
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

type MakeSourcePlugin = (_: Args | Thunk<Args> | Thunk<Promise<Args>>) => Promise<SourcePlugin>

export const fromLocalContent: MakeSourcePlugin = async (argsOrArgsThunk) => {
  const {
    contentDirPath,
    documentTypes,
    onMissingOrIncompatibleData = 'skip',
    onExtraData = 'warn',
    extensions,
    ...options
  } = typeof argsOrArgsThunk === 'function' ? await argsOrArgsThunk() : argsOrArgsThunk
  const documentTypeDefs = (Array.isArray(documentTypes) ? documentTypes : Object.values(documentTypes)).map((_) =>
    _.def(),
  )

  return {
    type: 'local',
    extensions: extensions ?? {},
    provideSchema: () => makeCoreSchema({ documentDefs: documentTypeDefs }),
    fetchData: ({ watch }) => {
      const filePathPatternMap = documentTypeDefs.reduce(
        (acc, documentDef) => ({ ...acc, [documentDef.name]: documentDef.filePathPattern }),
        {} as FilePathPatternMap,
      )
      const flags: Flags = { onExtraData, onMissingOrIncompatibleData }

      const schemaDef = makeCoreSchema({ documentDefs: documentTypeDefs })
      const initEvent: CustomUpdateEventInit = { _tag: 'init' }

      let cache: Cache | undefined = undefined

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
                cache = await loadPreviousCacheFromDisk({ schemaHash: schemaDef.hash })
              }
              return event
            }),
            mergeMap(async (event) => {
              switch (event._tag) {
                case 'init':
                  return fetchAllDocuments({
                    schemaDef,
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
                    schemaDef,
                    options,
                  })
                }
                default:
                  casesHandled(event)
              }
            }),
          )
          // update local and persisted cache
          .pipe(
            tap(async (cache_) => {
              cache = cache_
              await writeCacheToDisk({ cache, schemaHash: schemaDef.hash })
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
  schemaDef,
  options,
}: {
  contentDirPath: string
  filePathPatternMap: FilePathPatternMap
  cache: Cache
  event: CustomUpdateEventFileUpdated
  flags: Flags
  schemaDef: SchemaDef
  options: Options
}): Promise<Cache> => {
  // TODO re-implement with better glob identity matching
  const documentDefNameWithFilePathArray = await getDocumentDefNameWithRelativeFilePathArray({
    contentDirPath,
    filePathPatternMap,
  })
  const documentDefName = documentDefNameWithFilePathArray.find(
    (_) => _.relativeFilePath === event.relativeFilePath,
  )?.documentDefName

  if (!documentDefName) {
    console.log(
      `Tried to update cache. No matching document def found called ${documentDefName} for file ${event.relativeFilePath}`,
    )
    return cache
  }

  const cacheItem = await makeCacheItemFromFilePath({
    contentDirPath,
    documentDefName,
    relativeFilePath: event.relativeFilePath,
    flags,
    schemaDef,
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
      casesHandled(eventName)
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
