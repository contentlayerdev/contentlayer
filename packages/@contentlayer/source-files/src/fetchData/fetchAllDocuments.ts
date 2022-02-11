import type * as core from '@contentlayer/core'
import type { PosixFilePath } from '@contentlayer/utils'
import { posixFilePath } from '@contentlayer/utils'
import type { HasConsole } from '@contentlayer/utils/effect'
import { Chunk, O, OT, pipe, T } from '@contentlayer/utils/effect'
import { fs } from '@contentlayer/utils/node'
import { promise as glob } from 'glob-promise'
import * as os from 'os'

import { FetchDataError } from '../errors/index.js'
import type { Flags } from '../index.js'
import type { ContentTypeMap, FilePathPatternMap } from '../types.js'
import type { HasDocumentTypeMapState } from './DocumentTypeMap.js'
import { DocumentTypeMapState, provideDocumentTypeMapState } from './DocumentTypeMap.js'
import { makeCacheItemFromFilePath } from './makeCacheItemFromFilePath.js'

export const fetchAllDocuments = ({
  coreSchemaDef,
  filePathPatternMap,
  contentDirPath,
  contentTypeMap,
  flags,
  options,
  previousCache,
  verbose,
}: {
  coreSchemaDef: core.SchemaDef
  filePathPatternMap: FilePathPatternMap
  contentDirPath: PosixFilePath
  contentTypeMap: ContentTypeMap
  flags: Flags
  options: core.PluginOptions
  previousCache: core.DataCache.Cache | undefined
  verbose: boolean
}): T.Effect<OT.HasTracer & HasConsole, fs.UnknownFSError | core.HandledFetchDataError, core.DataCache.Cache> =>
  pipe(
    T.gen(function* ($) {
      const allRelativeFilePaths = yield* $(getAllRelativeFilePaths({ contentDirPath }))

      const concurrencyLimit = os.cpus().length

      const { dataErrors, documents } = yield* $(
        pipe(
          allRelativeFilePaths,
          T.forEachParN(concurrencyLimit, (relativeFilePath) =>
            makeCacheItemFromFilePath({
              relativeFilePath,
              filePathPatternMap,
              coreSchemaDef,
              contentDirPath,
              options,
              previousCache,
              contentTypeMap,
            }),
          ),
          T.map(Chunk.partitionThese),
          T.map(({ tuple: [errors, docs] }) => ({ dataErrors: Chunk.toArray(errors), documents: Chunk.toArray(docs) })),
        ),
      )

      const singletonDataErrors = yield* $(validateSingletonDocuments({ coreSchemaDef, filePathPatternMap }))

      yield* $(
        FetchDataError.handleErrors({
          errors: [...dataErrors, ...singletonDataErrors],
          documentCount: allRelativeFilePaths.length,
          flags,
          options,
          schemaDef: coreSchemaDef,
          contentDirPath,
          verbose,
        }),
      )

      const cacheItemsMap = Object.fromEntries(documents.map((_) => [_.document._id, _]))

      return { cacheItemsMap }
    }),
    provideDocumentTypeMapState,
    OT.withSpan('@contentlayer/source-local/fetchData:fetchAllDocuments', { attributes: { contentDirPath } }),
  )

const getAllRelativeFilePaths = ({
  contentDirPath,
}: {
  contentDirPath: string
}): T.Effect<OT.HasTracer, fs.UnknownFSError, PosixFilePath[]> => {
  const filePathPattern = '**/*.{md,mdx,json,yaml,yml}'
  return pipe(
    T.tryCatchPromise(
      () => glob(filePathPattern, { cwd: contentDirPath }),
      (error) => new fs.UnknownFSError({ error }),
    ),
    T.map((_) => _.map(posixFilePath)),
    OT.withSpan('@contentlayer/source-local/fetchData:getAllRelativeFilePaths'),
  )
}

const validateSingletonDocuments = ({
  coreSchemaDef,
  filePathPatternMap,
}: {
  coreSchemaDef: core.SchemaDef
  filePathPatternMap: FilePathPatternMap
}): T.Effect<HasDocumentTypeMapState, never, FetchDataError.SingletonDocumentNotFoundError[]> =>
  T.gen(function* ($) {
    const singletonDocumentDefs = Object.values(coreSchemaDef.documentTypeDefMap).filter(
      (documentTypeDef) => documentTypeDef.isSingleton,
    )

    const documentTypeMap = yield* $(DocumentTypeMapState.get)

    const invertedFilePathPattnernMap = invertRecord(filePathPatternMap)

    return singletonDocumentDefs
      .filter(
        (documentTypeDef) =>
          pipe(
            documentTypeMap.getFilePaths(documentTypeDef.name),
            O.map((_) => _.length),
            O.getOrElse(() => 0),
          ) !== 1,
      )
      .map(
        (documentTypeDef) =>
          new FetchDataError.SingletonDocumentNotFoundError({
            documentTypeName: documentTypeDef.name,
            filePath: invertedFilePathPattnernMap[documentTypeDef.name],
          }),
      )
  })

const invertRecord = (record: Record<string, string>): Record<string, string> =>
  pipe(Object.entries(record), (entries) => entries.map(([key, value]) => [value, key]), Object.fromEntries)
