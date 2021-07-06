import type { Cache, Options, SchemaDef, SourcePlugin } from '@contentlayer/core'
import { getArtifactsDir } from '@contentlayer/core'
import { casesHandled } from '@contentlayer/utils'
import * as chokidar from 'chokidar'
import { promises as fs } from 'fs'
import * as path from 'path'
import type { Observable } from 'rxjs'
import { defer, fromEvent, of } from 'rxjs'
import { map, mergeMap, startWith, tap } from 'rxjs/operators'

import { fetchAllDocuments, getDocumentDefNameWithRelativeFilePathArray, makeCacheItemFromFilePath } from './fetchData'
import { makeCoreSchema } from './provideSchema'
import type { DocumentDef, Thunk } from './schema'
import type { FilePathPatternMap } from './types'

export * from './schema'
export * from './types'

type Args = {
  schema: Thunk<DocumentDef>[] | Record<string, Thunk<DocumentDef>>
  contentDirPath: string
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
    schema: documentDefs_,
    onMissingOrIncompatibleData = 'skip',
    onExtraData = 'warn',
    ...options
  } = typeof argsOrArgsThunk === 'function' ? await argsOrArgsThunk() : argsOrArgsThunk
  const documentDefs = (Array.isArray(documentDefs_) ? documentDefs_ : Object.values(documentDefs_)).map((_) => _())

  return {
    type: 'local',
    provideSchema: () => makeCoreSchema({ documentDefs }),
    fetchData: ({ watch }) => {
      const filePathPatternMap = documentDefs.reduce(
        (acc, documentDef) => ({ ...acc, [documentDef.name]: documentDef.filePathPattern }),
        {} as FilePathPatternMap,
      )
      const flags: Flags = { onExtraData, onMissingOrIncompatibleData }

      const schemaDef = makeCoreSchema({ documentDefs })
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

const loadPreviousCacheFromDisk = async ({ schemaHash }: { schemaHash: string }): Promise<Cache | undefined> => {
  const filePath = path.join(getArtifactsDir(), 'cache', `${schemaHash}.json`)
  try {
    const file = await fs.readFile(filePath, 'utf8')
    return JSON.parse(file)
  } catch (e) {
    return undefined
  }
}

const writeCacheToDisk = async ({ cache, schemaHash }: { cache: Cache; schemaHash: string }): Promise<void> => {
  const cacheDirPath = path.join(getArtifactsDir(), 'cache')
  const filePath = path.join(cacheDirPath, `${schemaHash}.json`)

  await fs.mkdir(cacheDirPath, { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(cache), 'utf8')
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
