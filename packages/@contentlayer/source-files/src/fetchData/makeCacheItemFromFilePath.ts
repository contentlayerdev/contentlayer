import type * as core from '@contentlayer/core'
import type { AbsolutePosixFilePath, RelativePosixFilePath } from '@contentlayer/utils'
import { filePathJoin, fs } from '@contentlayer/utils'
import type { HasConsole } from '@contentlayer/utils/effect'
import { identity, O, OT, pipe, T, These } from '@contentlayer/utils/effect'
import matter from 'gray-matter'
import yaml from 'yaml'

import { FetchDataError } from '../errors/index.js'
import type { ContentTypeMap, FilePathPatternMap } from '../types.js'
import { makeAndProvideDocumentContext } from './DocumentContext.js'
import type { HasDocumentTypeMapState } from './DocumentTypeMap.js'
import { DocumentTypeMapState } from './DocumentTypeMap.js'
import { makeDocument } from './mapping/index.js'
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
  relativeFilePath: RelativePosixFilePath
  filePathPatternMap: FilePathPatternMap
  coreSchemaDef: core.SchemaDef
  contentDirPath: AbsolutePosixFilePath
  options: core.PluginOptions
  previousCache: core.DataCache.Cache | undefined
  contentTypeMap: ContentTypeMap
}): T.Effect<
  OT.HasTracer & HasConsole & HasDocumentTypeMapState & core.HasCwd & fs.HasFs,
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
            contentDirPath,
            contentTypeMap,
          }),
          T.chain(These.toEffect),
          T.map((_) => _.tuple),
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
          makeAndProvideDocumentContext({ rawContent, relativeFilePath, documentTypeDef }),
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

      return These.warnOption(
        { document, documentHash, hasWarnings: O.isSome(warnings), documentTypeName: documentTypeDef.name },
        warnings,
      )
    }),
    OT.withSpan('@contentlayer/source-local/fetchData:makeCacheItemFromFilePath', { attributes: { relativeFilePath } }),
    T.mapError((error) => {
      switch (error._tag) {
        case 'fs.StatError':
        case 'fs.ReadFileError':
        case 'fs.FileNotFoundError':
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
  fullFilePath: AbsolutePosixFilePath
  relativeFilePath: RelativePosixFilePath
}): T.Effect<
  OT.HasTracer & fs.HasFs,
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
  documentFilePath: RelativePosixFilePath
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
          (error) => new FetchDataError.ComputedValueError({ error, documentFilePath, documentTypeDef }),
        ),
    }),
  )
}

const parseMarkdown = ({
  markdownString,
  documentFilePath,
}: {
  markdownString: string
  documentFilePath: RelativePosixFilePath
}): T.Effect<
  unknown,
  FetchDataError.InvalidMarkdownFileError | FetchDataError.InvalidFrontmatterError,
  matter.GrayMatterFile<string>
> =>
  T.tryCatch(
    () =>
      matter(markdownString, {
        engines: {
          // Provide custom YAML engine to avoid parsing of date values https://github.com/jonschlinkert/gray-matter/issues/62)
          yaml: (str) => yaml.parse(str),
        },
      }),
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
  documentFilePath: RelativePosixFilePath
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
  documentFilePath: RelativePosixFilePath
}): T.Effect<unknown, FetchDataError.InvalidYamlFileError, Record<string, any>> =>
  T.tryCatch(
    () => yaml.parse(yamlString) ?? {},
    (error) => new FetchDataError.InvalidYamlFileError({ error, documentFilePath }),
  )
