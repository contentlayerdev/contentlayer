import type * as core from '@contentlayer/core'
import type { PosixFilePath } from '@contentlayer/utils'
import { asMutableArray, posixFilePath } from '@contentlayer/utils'
import type { HasConsole } from '@contentlayer/utils/effect'
import { Chunk, E, HashMap, O, Option, OT, pipe, T, These, Tp } from '@contentlayer/utils/effect'
import { fs } from '@contentlayer/utils/node'
import glob from 'fast-glob'
import * as os from 'node:os'

import { FetchDataError } from '../errors/index.js'
import type { Flags } from '../index.js'
import type { ContentTypeMap, FilePathPatternMap } from '../types.js'
import { DocumentTypeMap, provideDocumentTypeMapState } from './DocumentTypeMap.js'
import { fromWorkerPool } from './makeCacheItemFromFilePath.worker.js'
// import {createPool} from './makeCacheItemFromFilePath.worker.js'

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
  contentDirPath: PosixFilePath
  contentDirInclude: readonly PosixFilePath[]
  contentDirExclude: readonly PosixFilePath[]
  contentTypeMap: ContentTypeMap
  flags: Flags
  options: core.PluginOptions
  previousCache: core.DataCache.Cache | undefined
  verbose: boolean
}): T.Effect<OT.HasTracer & HasConsole, fs.UnknownFSError | core.HandledFetchDataError, core.DataCache.Cache> =>
  pipe(
    T.gen(function* ($) {
      const allRelativeFilePaths = yield* $(
        getAllRelativeFilePaths({ contentDirPath, contentDirInclude, contentDirExclude }),
      )

      const concurrencyLimit = os.cpus().length

      const makeCacheItemFromFilePath = fromWorkerPool()
      const { dataErrors, documents, documentTypeMap } = yield* $(
        pipe(
          allRelativeFilePaths,
          // TODO: parallalize
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
          T.map((chunk) => {
            let errors = Chunk.empty<FetchDataError.FetchDataError>()
            let values = Chunk.empty<core.DataCache.CacheItem>()
            let documentTypeMap = DocumentTypeMap.init()

            Chunk.forEach_(chunk, (_) => {
              const [a, documentTypeTupleOption] = _.tuple
              if (Option.isSome(documentTypeTupleOption)) {
                const [documentTypeName, relativeFilePath] = documentTypeTupleOption.value.tuple
                documentTypeMap = documentTypeMap.add(documentTypeName, relativeFilePath)
              }
              const res = These.result(a)
              if (E.isLeft(res)) {
                // FIXME: type
                errors = Chunk.append_(errors, FetchDataError.fromSerialized(res.left as unknown as any))
              } else {
                values = Chunk.append_(values, res.right.tuple[0])
                const warning = res.right.tuple[1]
                if (O.isSome(warning)) {
                  errors = Chunk.append_(errors, warning.value)
                }
              }
            })

            return Tp.tuple(errors, values, documentTypeMap)
          }),
          T.map(({ tuple: [errors, docs, documentTypeMap] }) => ({
            dataErrors: Chunk.toArray(errors),
            documents: Chunk.toArray(docs),
            documentTypeMap,
          })),
        ),
      )

      const singletonDataErrors = validateSingletonDocuments({ coreSchemaDef, filePathPatternMap, documentTypeMap })

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
  contentDirPath: string
  contentDirInclude: readonly PosixFilePath[]
  contentDirExclude: readonly PosixFilePath[]
}): T.Effect<OT.HasTracer, fs.UnknownFSError, PosixFilePath[]> => {
  const getPatternPrefix = (paths_: readonly string[]) => {
    const paths = paths_
      .map((_) => _.trim())
      .filter((_) => _ !== '.' && _ !== './')
      .map((_) => (_.endsWith('/') ? _ : `${_}/`))

    if (paths.length === 0) return ''
    if (paths.length === 1) return paths[0]
    return `{${paths.join(',')}}`
  }

  const filePathPattern = '**/*.{md,mdx,json,yaml,yml}'
  const pattern = `${getPatternPrefix(contentDirInclude)}${filePathPattern}`

  return pipe(
    T.tryCatchPromise(
      () => glob(pattern, { cwd: contentDirPath, ignore: asMutableArray(contentDirExclude) }),
      (error) => new fs.UnknownFSError({ error }),
    ),
    T.map((_) => _.map(posixFilePath)),
    OT.withSpan('@contentlayer/source-local/fetchData:getAllRelativeFilePaths'),
  )
}

const validateSingletonDocuments = ({
  coreSchemaDef,
  filePathPatternMap,
  documentTypeMap,
}: {
  coreSchemaDef: core.SchemaDef
  filePathPatternMap: FilePathPatternMap
  documentTypeMap: DocumentTypeMap
}): FetchDataError.SingletonDocumentNotFoundError[] => {
  const singletonDocumentDefs = Object.values(coreSchemaDef.documentTypeDefMap).filter(
    (documentTypeDef) => documentTypeDef.isSingleton,
  )

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
}

const invertRecord = (record: Record<string, string>): Record<string, string> =>
  pipe(Object.entries(record), (entries) => entries.map(([key, value]) => [value, key]), Object.fromEntries)
