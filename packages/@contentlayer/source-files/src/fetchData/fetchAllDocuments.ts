import type * as core from '@contentlayer/core'
import { Chunk, O, OT, pipe, T, These } from '@contentlayer/utils/effect'
import { fs } from '@contentlayer/utils/node'
import { promise as glob } from 'glob-promise'
import matter from 'gray-matter'
import * as os from 'os'
import * as path from 'path'
import yaml from 'yaml'

import { FetchDataError } from '../errors/index.js'
import type { Flags } from '../index.js'
import type { FilePathPatternMap } from '../types.js'
import { makeDocument } from './mapping.js'
import type { RawContent } from './types.js'
import { validateDocumentData } from './validate.js'

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
  contentDirPath: string
  flags: Flags
  options: core.PluginOptions
  previousCache: core.DataCache.Cache | undefined
  verbose: boolean
}): T.Effect<OT.HasTracer, fs.UnknownFSError, core.DataCache.Cache> =>
  pipe(
    T.gen(function* ($) {
      const allRelativeFilePaths = yield* $(getAllRelativeFilePaths({ contentDirPath }))

      const concurrencyLimit = os.cpus().length

      const { left: dataErrors, right: documents } = yield* $(
        pipe(
          allRelativeFilePaths,
          T.forEachParN(concurrencyLimit, (relativeFilePath) =>
            makeCacheItemFromFilePath({
              relativeFilePath,
              filePathPatternMap,
              coreSchemaDef: coreSchemaDef,
              contentDirPath,
              options,
              previousCache,
            }),
          ),
          T.map(Chunk.partitionThese),
        ),
      )

      yield* $(
        FetchDataError.handleErrors({
          errors: Chunk.toArray(dataErrors),
          documentCount: allRelativeFilePaths.length,
          flags,
          options,
          schemaDef: coreSchemaDef,
          verbose,
        }),
      )

      const cacheItemsMap = Object.fromEntries(Chunk.map_(documents, (_) => [_.document._id, _]))

      return { cacheItemsMap }
    }),
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
  relativeFilePath: string
  filePathPatternMap: FilePathPatternMap
  coreSchemaDef: core.SchemaDef
  contentDirPath: string
  options: core.PluginOptions
  previousCache: core.DataCache.Cache | undefined
}): T.Effect<OT.HasTracer, never, These.These<FetchDataError.FetchDataError, core.DataCache.CacheItem>> =>
  pipe(
    T.gen(function* ($) {
      const fullFilePath = path.join(contentDirPath, relativeFilePath)

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
        return These.succeed(previousCache.cacheItemsMap[relativeFilePath]!)
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
          These.toEffect,
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

      return These.warnOption({ document, documentHash, hasWarnings: O.isSome(warnings) }, warnings)
    }),
    OT.withSpan('@contentlayer/source-local/fetchData:makeDocumentFromFilePath'),
    T.mapError((error) => {
      if (
        error._tag === 'node.fs.StatError' ||
        error._tag === 'node.fs.ReadFileError' ||
        error._tag === 'node.fs.FileNotFoundError'
      ) {
        return new FetchDataError.UnexpectedError({ error, documentFilePath: relativeFilePath })
      } else {
        return error
      }
    }),
    These.effectThese,
  )

const processRawContent = ({
  fullFilePath,
  relativeFilePath,
}: {
  fullFilePath: string
  relativeFilePath: string
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
  documentFilePath: string
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
}): T.Effect<unknown, fs.UnknownFSError, string[]> => {
  const filePathPattern = '**/*.{md,mdx,json,yaml,yml}'
  return T.tryCatchPromise(
    () => glob(filePathPattern, { cwd: contentDirPath }),
    (error) => new fs.UnknownFSError({ error }),
  )
}

const parseMarkdown = ({
  markdownString,
  documentFilePath,
}: {
  markdownString: string
  documentFilePath: string
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
  documentFilePath: string
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
  documentFilePath: string
}): T.Effect<unknown, FetchDataError.InvalidYamlFileError, Record<string, any>> =>
  T.tryCatch(
    () => yaml.parse(yamlString),
    (error) => new FetchDataError.InvalidYamlFileError({ error, documentFilePath }),
  )
