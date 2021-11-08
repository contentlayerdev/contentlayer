import type { E } from '@contentlayer/utils/effect'
import { OT, pipe, T } from '@contentlayer/utils/effect'
import type { GetContentlayerVersionError } from '@contentlayer/utils/node'
import { fs } from '@contentlayer/utils/node'
import * as path from 'path'

import { ArtifactsDir } from './ArtifactsDir.js'
import type { HasCwd } from './cwd.js'
import type { Document } from './data.js'

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
  }: {
    schemaHash: string
  }): T.Effect<
    OT.HasTracer & HasCwd,
    fs.StatError | fs.ReadFileError | fs.JsonParseError | GetContentlayerVersionError,
    Cache | undefined
  > =>
    T.gen(function* ($) {
      const cacheDirPath = yield* $(ArtifactsDir.getCacheDirPath)
      const filePath = path.join(cacheDirPath, dataCacheFileName(schemaHash))

      const cache = yield* $(
        pipe(
          fs.readFileJsonIfExists<Cache>(filePath),
          OT.withSpan('@contentlayer/core/cache:loadPreviousCacheFromDisk', { attributes: { schemaHash, filePath } }),
        ),
      )

      return cache
    })

  export const writeCacheToDisk = ({
    cache,
    schemaHash,
  }: {
    cache: Cache
    schemaHash: string
  }): T.Effect<
    OT.HasTracer & HasCwd,
    never,
    E.Either<fs.WriteFileError | fs.MkdirError | fs.JsonStringifyError | GetContentlayerVersionError, void>
  > =>
    pipe(
      ArtifactsDir.mkdirCache,
      T.chain((cacheDirPath) => {
        const filePath = path.join(cacheDirPath, dataCacheFileName(schemaHash))
        return fs.writeFileJson({ filePath, content: cache })
      }),
      T.either,
    )

  const dataCacheFileName = (schemaHash: string) => `data-${schemaHash}.json`
}
