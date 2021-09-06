import { promises as fs } from 'fs'
import * as path from 'path'

import type { Document } from './data'
import { getArtifactsDir } from './utils'

export type Cache = {
  /**
   * A map containing all documents wrapped in a {@link CacheItem} indexed by id.
   * We're using a map/record here (instead of a simple array) since it's easier and more efficient
   * to implement cache operations (e.g. lookup, update, delete) this way.
   */
  cacheItemsMap: { [id: string]: CacheItem }
}

export type CacheItem = {
  document: Document
  /**
   * The `documentHash` is used to determine if a document has changed and it's value-generation is implemented
   * by a given plugin (e.g. based on the last-edit date in source-files)
   */
  documentHash: string
}

export const loadPreviousCacheFromDisk = async ({ schemaHash }: { schemaHash: string }): Promise<Cache | undefined> => {
  const filePath = path.join(getArtifactsDir(), 'cache', `${schemaHash}.json`)
  try {
    const file = await fs.readFile(filePath, 'utf8')
    return JSON.parse(file)
  } catch (e: any) {
    return undefined
  }
}

export const writeCacheToDisk = async ({ cache, schemaHash }: { cache: Cache; schemaHash: string }): Promise<void> => {
  const cacheDirPath = path.join(getArtifactsDir(), 'cache')
  const filePath = path.join(cacheDirPath, `${schemaHash}.json`)

  await fs.mkdir(cacheDirPath, { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(cache), 'utf8')
}
