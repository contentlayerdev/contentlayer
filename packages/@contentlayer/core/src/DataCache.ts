import type { E } from '@contentlayer/utils/effect'
import { OT, pipe, T } from '@contentlayer/utils/effect'
import { fs } from '@contentlayer/utils/node'
import * as path from 'path'

import { ArtifactsDir } from './ArtifactsDir'
import type { Document } from './data'

export namespace DataCache {
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
     * Until all data types are serializable, we can't cache warnings.
     */
    hasWarnings: boolean
    /**
     * The `documentHash` is used to determine if a document has changed and it's value-generation is implemented
     * by a given plugin (e.g. based on the last-edit date in source-files)
     */
    documentHash: string
  }

  export const loadPreviousCacheFromDisk = ({
    schemaHash,
    cwd,
  }: {
    schemaHash: string
    cwd: string
  }): T.Effect<OT.HasTracer, fs.ReadFileError | fs.JsonParseError, Cache | undefined> => {
    const filePath = path.join(ArtifactsDir.getCacheDirPath({ cwd }), dataCacheFileName(schemaHash))
    return pipe(
      fs.readFileJson<Cache>(filePath),
      T.catchTag('node.fs.FileNotFoundError', () => T.succeed(undefined)),
      OT.withSpan('@contentlayer/core/cache:loadPreviousCacheFromDisk', { attributes: { schemaHash, filePath } }),
    )
  }

  export const writeCacheToDisk = ({
    cache,
    schemaHash,
    cwd,
  }: {
    cache: Cache
    schemaHash: string
    cwd: string
  }): T.Effect<OT.HasTracer, never, E.Either<fs.WriteFileError | fs.MkdirError | fs.JsonStringifyError, void>> =>
    pipe(
      ArtifactsDir.mkdirCache({ cwd }),
      T.chain((cacheDirPath) => {
        const filePath = path.join(cacheDirPath, dataCacheFileName(schemaHash))
        return fs.writeFileJson({ filePath, content: cache })
      }),
      T.either,
    )

  const dataCacheFileName = (schemaHash: string) => `data-${schemaHash}.json`
}
