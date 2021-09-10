import type { E } from '@contentlayer/utils/effect'
import { OT, pipe, T } from '@contentlayer/utils/effect'
import * as node from '@contentlayer/utils/node'
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

export const loadPreviousCacheFromDisk = ({
  schemaHash,
}: {
  schemaHash: string
}): T.Effect<OT.HasTracer, node.ReadFileError | node.JsonParseError, Cache | undefined> => {
  const filePath = path.join(getArtifactsDir(), 'cache', `${schemaHash}.json`)
  return pipe(
    node.readFileJson<Cache>(filePath),
    T.catchTag('FileNotFoundError', () => T.succeed(undefined)),
    OT.withSpan('@contentlayer/core/cache:loadPreviousCacheFromDisk', { attributes: { schemaHash } }),
  )
}

export const writeCacheToDisk = ({
  cache,
  schemaHash,
}: {
  cache: Cache
  schemaHash: string
}): T.Effect<OT.HasTracer, never, E.Either<node.WriteFileError | node.MkdirError | node.JsonStringifyError, void>> => {
  const cacheDirPath = path.join(getArtifactsDir(), 'cache')
  const filePath = path.join(cacheDirPath, `${schemaHash}.json`)

  return pipe(
    node.mkdirp(cacheDirPath),
    T.chain(() => node.writeFileJson({ filePath, content: cache })),
    T.either,
  )
}
