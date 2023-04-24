import * as os from 'node:os'

import type * as core from '@contentlayer/core'
import type { AbsolutePosixFilePath, RelativePosixFilePath } from '@contentlayer/utils'
import { asMutableArray, fs, relativePosixFilePath } from '@contentlayer/utils'
import type { HasConsole } from '@contentlayer/utils/effect'
import { Chunk, O, OT, pipe, T } from '@contentlayer/utils/effect'
import glob from 'fast-glob'

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
  contentDirInclude,
  contentDirExclude,
  contentTypeMap,
  flags,
  options,
  previousCache,
  verbose,
}: {
  coreSchemaDef: core.SchemaDef
  filePathPatternMap: FilePathPatternMap
  contentDirPath: AbsolutePosixFilePath
  contentDirInclude: readonly RelativePosixFilePath[]
  contentDirExclude: readonly RelativePosixFilePath[]
  contentTypeMap: ContentTypeMap
  flags: Flags
  options: core.PluginOptions
  previousCache: core.DataCache.Cache | undefined
  verbose: boolean
}): T.Effect<
  OT.HasTracer & HasConsole & core.HasCwd & fs.HasFs,
  fs.UnknownFSError | core.HandledFetchDataError,
  core.DataCache.Cache
> =>
  pipe(
    T.gen(function* ($) {
      const allRelativeFilePaths = yield* $(
        getAllRelativeFilePaths({ contentDirPath, contentDirInclude, contentDirExclude }),
      )

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
  contentDirInclude,
  contentDirExclude,
}: {
  contentDirPath: AbsolutePosixFilePath
  contentDirInclude: readonly RelativePosixFilePath[]
  contentDirExclude: readonly RelativePosixFilePath[]
}): T.Effect<OT.HasTracer, fs.UnknownFSError, RelativePosixFilePath[]> => {
  const getPatternPrefix = (paths_: readonly string[]) => {
    const paths = paths_
      .map((_) => _.trim())
      .filter((_) => _ !== '.' && _ !== './')
      .map((_) => (_.endsWith('/') ? _ : `${_}/`))

    if (paths.length === 0) return ''
    if (paths.length === 1) return paths[0]
    return `{${paths.join(',')}}`
  }

  const filePathPattern = '{,**/}*.{md,mdx,json,yaml,yml}'
  const pattern = `${getPatternPrefix(contentDirInclude)}${filePathPattern}`

  return pipe(
    T.tryCatchPromise(
      () => glob(pattern, { cwd: contentDirPath, ignore: asMutableArray(contentDirExclude) }),
      (error) => new fs.UnknownFSError({ error }),
    ),
    T.map((_) => _.map(relativePosixFilePath)),
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
            documentTypeDef,
            filePath: invertedFilePathPattnernMap[documentTypeDef.name],
          }),
      )
  })

const invertRecord = (record: Record<string, string>): Record<string, string> =>
  pipe(Object.entries(record), (entries) => entries.map(([key, value]) => [value, key]), Object.fromEntries)
