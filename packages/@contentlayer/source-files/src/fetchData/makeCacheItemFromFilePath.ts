import type * as core from '@contentlayer/core'
import type { PosixFilePath } from '@contentlayer/utils'
import { filePathJoin } from '@contentlayer/utils'
import type { HasConsole } from '@contentlayer/utils/effect'
import { E, identity, O, Option, OT, pipe, T, These, Tuple } from '@contentlayer/utils/effect'
import { fs } from '@contentlayer/utils/node'
import matter from 'gray-matter'
import yaml from 'yaml'

import { FetchDataError } from '../errors/index.js'
import type { ContentTypeMap, FilePathPatternMap } from '../types.js'
import { makeAndProvideDocumentContext } from './DocumentContext.js'
import type { DocumentTypeName, HasDocumentTypeMapState } from './DocumentTypeMap.js'
import { DocumentTypeMapState } from './DocumentTypeMap.js'
import { makeDocument } from './mapping.js'
import type { RawContent, RawContentJSON, RawContentMarkdown, RawContentMDX, RawContentYAML } from './types.js'
import { validateDocumentData } from './validateDocumentData.js'

export const makeCacheItemFromFilePath = ({
  relativeFilePath,
  filePathPatternMap,
  coreSchemaDef,
  contentDirPath,
  options,
  previousCache,
  contentTypeMap,
}: {
  relativeFilePath: PosixFilePath
  filePathPatternMap: FilePathPatternMap
  coreSchemaDef: core.SchemaDef
  contentDirPath: PosixFilePath
  options: core.PluginOptions
  previousCache: core.DataCache.Cache | undefined
  contentTypeMap: ContentTypeMap
}): T.Effect<
  OT.HasTracer & HasConsole,
  never,
  Tuple.Tuple<
    [
      These.These<FetchDataError.FetchDataError, core.DataCache.CacheItem>,
      Option.Option<Tuple.Tuple<[DocumentTypeName, PosixFilePath]>>,
    ]
  >
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
        const documentTypeTuple = Option.some(Tuple.tuple(cacheItem.documentTypeName, relativeFilePath))

        return Tuple.tuple(These.succeed(cacheItem), documentTypeTuple)
      }

      const rawContent = yield* $(processRawContent({ fullFilePath, relativeFilePath }))

      const {
        data: [{ documentTypeDef }, warnings],
        documentTypeTuple,
      } = yield* $(
        pipe(
          validateDocumentData({
            rawContent,
            relativeFilePath,
            coreSchemaDef,
            filePathPatternMap,
            options,
            contentDirPath,
            contentTypeMap,
          }),
          T.map((_) => _.tuple),
          T.chain(([data, documentTypeTuple]) =>
            pipe(
              These.toEffect(data),
              T.map((_) => _.tuple),
              T.map((data) => ({ data, documentTypeTuple })),
            ),
          ),
        ),
      )

      const document = yield* $(
        pipe(
          makeDocument({
            documentTypeDef,
            rawContent,
            coreSchemaDef,
            relativeFilePath,
            contentDirPath,
            options,
          }),
          makeAndProvideDocumentContext({ rawContent, relativeFilePath }),
        ),
      )

      const computedValues = yield* $(
        getComputedValues({ documentTypeDef, document, documentFilePath: relativeFilePath }),
      )
      if (computedValues) {
        Object.entries(computedValues).forEach(([fieldName, value]) => {
          document[fieldName] = value
        })
      }

      return Tuple.tuple(
        These.warnOption(
          {
            document,
            documentHash,
            hasWarnings: O.isSome(warnings),
            documentTypeName: documentTypeDef.name,
          },
          warnings,
        ),
        documentTypeTuple,
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
    T.either,
    T.map(E.fold((e) => Tuple.tuple(These.fail(e), Option.none), identity)),
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
          return identity<RawContentMarkdown>({
            kind: 'markdown',
            fields: markdown.data,
            body: markdown.content,
            rawDocumentContent: fileContent,
          })
        }
        case 'mdx': {
          const markdown = yield* $(parseMarkdown({ markdownString: fileContent, documentFilePath: relativeFilePath }))
          return identity<RawContentMDX>({
            kind: 'mdx',
            fields: markdown.data,
            body: markdown.content,
            rawDocumentContent: fileContent,
          })
        }
        case 'json': {
          const fields = yield* $(parseJson({ jsonString: fileContent, documentFilePath: relativeFilePath }))
          return identity<RawContentJSON>({ kind: 'json', fields })
        }
        case 'yaml':
        case 'yml': {
          const fields = yield* $(parseYaml({ yamlString: fileContent, documentFilePath: relativeFilePath }))
          return identity<RawContentYAML>({ kind: 'yaml', fields })
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
