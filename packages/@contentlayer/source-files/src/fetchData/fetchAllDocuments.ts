import type * as core from '@contentlayer/core'
import type { PosixFilePath } from '@contentlayer/utils'
import { filePathJoin, posixFilePath } from '@contentlayer/utils'
import type { HasConsole } from '@contentlayer/utils/effect'
import { Chunk, O, OT, pipe, T, These } from '@contentlayer/utils/effect'
import { fs } from '@contentlayer/utils/node'
import { promise as glob } from 'glob-promise'
import matter from 'gray-matter'
import * as os from 'os'
import yaml from 'yaml'

import { FetchDataError } from '../errors/index.js'
import type { Flags } from '../index.js'
import type { FilePathPatternMap } from '../types.js'
import type { HasDocumentTypeMapState } from './DocumentTypeMap.js'
import { DocumentTypeMapState, provideDocumentTypeMapState } from './DocumentTypeMap.js'
import { makeDocument } from './mapping.js'
import type { RawContent } from './types.js'
import { validateDocumentData } from './validateDocumentData.js'

export const fetchAllDocuments = ({
  coreSchemaDef,
  filePathPatternMap,
  contentDirPath,
  flags,
  options,
  previousCache,
  verbose,
}: {
  coreSchemaDef: core.SchemaDef
  filePathPatternMap: FilePathPatternMap
  contentDirPath: PosixFilePath
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
            }),
          ),
          T.map(Chunk.partitionThese),
          T.map(({ left, right }) => ({ dataErrors: Chunk.toArray(left), documents: Chunk.toArray(right) })),
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
          verbose,
        }),
      )

      const cacheItemsMap = Object.fromEntries(documents.map((_) => [_.document._id, _]))

      return { cacheItemsMap }
    }),
    provideDocumentTypeMapState,
    OT.withSpan('@contentlayer/source-local/fetchData:fetchAllDocuments', { attributes: { contentDirPath } }),
  )

export const makeCacheItemFromFilePath = ({
  relativeFilePath,
  filePathPatternMap,
  coreSchemaDef,
  contentDirPath,
  options,
  previousCache,
}: {
  relativeFilePath: PosixFilePath
  filePathPatternMap: FilePathPatternMap
  coreSchemaDef: core.SchemaDef
  contentDirPath: PosixFilePath
  options: core.PluginOptions
  previousCache: core.DataCache.Cache | undefined
}): T.Effect<
  OT.HasTracer & HasConsole & HasDocumentTypeMapState,
  never,
  These.These<FetchDataError.FetchDataError, core.DataCache.CacheItem>
> =>
  pipe(
    T.gen(function* ($) {
      const fullFilePath = filePathJoin(contentDirPath, relativeFilePath)

      const documentHash = yield* $(
        pipe(
          fs.stat(fullFilePath),
          T.map((_) => _.mtime.getTime().toString()),
        ),
      )

      // return previous cache item if it exists
      if (
        previousCache &&
        previousCache.cacheItemsMap[relativeFilePath] &&
        previousCache.cacheItemsMap[relativeFilePath]!.documentHash === documentHash &&
        previousCache.cacheItemsMap[relativeFilePath]!.hasWarnings === false
      ) {
        const cacheItem = previousCache.cacheItemsMap[relativeFilePath]!
        yield* $(DocumentTypeMapState.update((_) => _.add(cacheItem.documentTypeName, relativeFilePath)))

        return These.succeed(cacheItem)
      }

      const rawContent = yield* $(processRawContent({ fullFilePath, relativeFilePath }))

      const [{ documentTypeDef }, warnings] = yield* $(
        pipe(
          validateDocumentData({
            rawContent,
            relativeFilePath,
            coreSchemaDef,
            filePathPatternMap,
            options,
          }),
          T.chain(These.toEffect),
          T.map((_) => _.tuple),
        ),
      )

      const document = yield* $(
        makeDocument({
          documentTypeDef,
          rawContent,
          coreSchemaDef,
          relativeFilePath,
          contentDirPath,
          options,
        }),
      )

      const computedValues = yield* $(
        getComputedValues({ documentTypeDef, document, documentFilePath: relativeFilePath }),
      )
      if (computedValues) {
        Object.entries(computedValues).forEach(([fieldName, value]) => {
          document[fieldName] = value
        })
      }

      return These.warnOption(
        { document, documentHash, hasWarnings: O.isSome(warnings), documentTypeName: documentTypeDef.name },
        warnings,
      )
    }),
    OT.withSpan('@contentlayer/source-local/fetchData:makeCacheItemFromFilePath'),
    T.mapError((error) => {
      switch (error._tag) {
        case 'node.fs.StatError':
        case 'node.fs.ReadFileError':
        case 'node.fs.FileNotFoundError':
          return new FetchDataError.UnexpectedError({ error, documentFilePath: relativeFilePath })
        default:
          return error
      }
    }),
    These.effectThese,
  )

const processRawContent = ({
  fullFilePath,
  relativeFilePath,
}: {
  fullFilePath: PosixFilePath
  relativeFilePath: PosixFilePath
}): T.Effect<
  OT.HasTracer,
  | FetchDataError.UnsupportedFileExtension
  | FetchDataError.InvalidFrontmatterError
  | FetchDataError.InvalidMarkdownFileError
  | FetchDataError.InvalidJsonFileError
  | FetchDataError.InvalidYamlFileError
  | fs.FileNotFoundError
  | fs.ReadFileError,
  RawContent
> =>
  pipe(
    T.gen(function* ($) {
      const fileContent = yield* $(fs.readFile(fullFilePath))
      const filePathExtension = relativeFilePath.toLowerCase().split('.').pop()!

      switch (filePathExtension) {
        case 'md': {
          const markdown = yield* $(parseMarkdown({ markdownString: fileContent, documentFilePath: relativeFilePath }))
          return { kind: 'markdown' as const, fields: markdown.data, body: markdown.content }
        }
        case 'mdx': {
          const markdown = yield* $(parseMarkdown({ markdownString: fileContent, documentFilePath: relativeFilePath }))
          return { kind: 'mdx' as const, fields: markdown.data, body: markdown.content }
        }
        case 'json': {
          const fields = yield* $(parseJson({ jsonString: fileContent, documentFilePath: relativeFilePath }))
          return { kind: 'json' as const, fields }
        }
        case 'yaml':
        case 'yml': {
          const fields = yield* $(parseYaml({ yamlString: fileContent, documentFilePath: relativeFilePath }))
          return { kind: 'yaml' as const, fields }
        }
        default:
          return yield* $(
            T.fail(
              new FetchDataError.UnsupportedFileExtension({ extension: filePathExtension, filePath: relativeFilePath }),
            ),
          )
      }
    }),
    OT.withSpan('@contentlayer/source-local/fetchData:getRawContent'),
  )

const getComputedValues = ({
  document,
  documentTypeDef,
  documentFilePath,
}: {
  documentTypeDef: core.DocumentTypeDef
  document: core.Document
  documentFilePath: PosixFilePath
}): T.Effect<unknown, FetchDataError.ComputedValueError, undefined | Record<string, any>> => {
  if (documentTypeDef.computedFields === undefined) {
    return T.succeed(undefined)
  }

  return pipe(
    documentTypeDef.computedFields,
    T.forEachParDict({
      mapKey: (field) => T.succeed(field.name),
      mapValue: (field) =>
        T.tryCatchPromise(
          async () => field.resolve(document),
          (error) => new FetchDataError.ComputedValueError({ error, documentFilePath }),
        ),
    }),
  )
}

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

const parseMarkdown = ({
  markdownString,
  documentFilePath,
}: {
  markdownString: string
  documentFilePath: PosixFilePath
}): T.Effect<
  unknown,
  FetchDataError.InvalidMarkdownFileError | FetchDataError.InvalidFrontmatterError,
  matter.GrayMatterFile<string>
> =>
  T.tryCatch(
    () => matter(markdownString),
    (error: any) => {
      if (error.name === 'YAMLException') {
        return new FetchDataError.InvalidFrontmatterError({ error, documentFilePath })
      } else {
        return new FetchDataError.InvalidMarkdownFileError({ error, documentFilePath })
      }
    },
  )

const parseJson = ({
  jsonString,
  documentFilePath,
}: {
  jsonString: string
  documentFilePath: PosixFilePath
}): T.Effect<unknown, FetchDataError.InvalidJsonFileError, Record<string, any>> =>
  T.tryCatch(
    () => JSON.parse(jsonString),
    (error) => new FetchDataError.InvalidJsonFileError({ error, documentFilePath }),
  )

const parseYaml = ({
  yamlString,
  documentFilePath,
}: {
  yamlString: string
  documentFilePath: PosixFilePath
}): T.Effect<unknown, FetchDataError.InvalidYamlFileError, Record<string, any>> =>
  T.tryCatch(
    () => yaml.parse(yamlString),
    (error) => new FetchDataError.InvalidYamlFileError({ error, documentFilePath }),
  )

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
