import type * as core from '@contentlayer/core'
import { Chunk, OT, pipe, T, These } from '@contentlayer/utils/effect'
import type { FileNotFoundError, ReadFileError } from '@contentlayer/utils/node'
import { fs, UnknownFSError } from '@contentlayer/utils/node'
import { promise as glob } from 'glob-promise'
import matter from 'gray-matter'
import * as yaml from 'js-yaml'
import * as os from 'os'
import * as path from 'path'

import type { Flags } from '..'
import type { FetchDataError } from '../errors'
import { ComputedValueError, UnsupportedFileExtension } from '../errors'
import { FetchDataAggregateError } from '../errors/aggregate'
import type { FilePathPatternMap } from '../types'
import { makeDocument } from './mapping'
import type { RawContent } from './types'
import { validateDocumentData } from './validate'

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
  previousCache: core.Cache | undefined
  verbose: boolean
}): T.Effect<OT.HasTracer, FetchDataError, core.Cache> =>
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
              flags,
              options,
              previousCache,
            }),
          ),
          T.map(Chunk.partitionThese),
        ),
      )

      const aggregateError = new FetchDataAggregateError({
        errors: Chunk.toArray(dataErrors),
        documentCount: allRelativeFilePaths.length,
        options,
        flags,
        schemaDef: coreSchemaDef,
        verbose,
      })

      console.log(aggregateError.toString())

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
  flags,
  options,
  previousCache,
}: {
  relativeFilePath: string
  filePathPatternMap: FilePathPatternMap
  coreSchemaDef: core.SchemaDef
  contentDirPath: string
  flags: Flags
  options: core.PluginOptions
  previousCache: core.Cache | undefined
}): T.Effect<OT.HasTracer, never, These.These<FetchDataError, core.CacheItem>> =>
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
        previousCache.cacheItemsMap[relativeFilePath]!.documentHash === documentHash
      ) {
        return These.succeed(previousCache.cacheItemsMap[relativeFilePath]!)
      }

      const rawContent = yield* $(processRawContent({ fullFilePath, relativeFilePath }))

      const {
        tuple: [{ documentTypeDef }, warnings],
      } = yield* $(
        pipe(
          validateDocumentData({
            rawContent,
            relativeFilePath,
            coreSchemaDef,
            filePathPatternMap,
            flags,
            options,
          }),
          These.toEffect,
        ),
      )

      const document = yield* $(
        makeDocument({
          documentTypeDef,
          rawContent,
          coreSchemaDef,
          relativeFilePath,
          options,
        }),
      )

      const computedValues = yield* $(getComputedValues({ documentDef: documentTypeDef, doc: document }))
      if (computedValues) {
        Object.entries(computedValues).forEach(([fieldName, value]) => {
          document[fieldName] = value
        })
      }

      return These.warnOption({ document, documentHash }, warnings)
    }),
    OT.withSpan('@contentlayer/source-local/fetchData:makeDocumentFromFilePath'),
    These.effectThese,
  )

const processRawContent = ({
  fullFilePath,
  relativeFilePath,
}: {
  fullFilePath: string
  relativeFilePath: string
}): T.Effect<OT.HasTracer, UnsupportedFileExtension | FileNotFoundError | ReadFileError, RawContent> =>
  pipe(
    T.gen(function* ($) {
      const fileContent = yield* $(fs.readFile(fullFilePath))
      const filePathExtension = relativeFilePath.toLowerCase().split('.').pop()!

      switch (filePathExtension) {
        case 'md': {
          const markdown = matter(fileContent)
          return { kind: 'markdown' as const, fields: markdown.data, body: markdown.content }
        }
        case 'mdx': {
          const markdown = matter(fileContent)
          return { kind: 'mdx' as const, fields: markdown.data, body: markdown.content }
        }
        case 'json':
          return { kind: 'json' as const, fields: JSON.parse(fileContent) }
        case 'yaml':
        case 'yml':
          return { kind: 'yaml' as const, fields: yaml.load(fileContent) as any }
        default:
          return yield* $(
            T.fail(new UnsupportedFileExtension({ extension: filePathExtension, filePath: relativeFilePath })),
          )
      }
    }),
    OT.withSpan('@contentlayer/source-local/fetchData:getRawContent'),
  )

const getComputedValues = ({
  doc,
  documentDef,
}: {
  documentDef: core.DocumentTypeDef
  doc: core.Document
}): T.Effect<unknown, ComputedValueError, undefined | Record<string, any>> => {
  if (documentDef.computedFields === undefined) {
    return T.succeed(undefined)
  }

  return pipe(
    documentDef.computedFields,
    T.forEachParDict({
      mapKey: (field) => T.succeed(field.name),
      mapValue: (field) =>
        T.tryCatchPromise(
          async () => field.resolve(doc),
          (error) => new ComputedValueError({ error }),
        ),
    }),
  )
}

const getAllRelativeFilePaths = ({
  contentDirPath,
}: {
  contentDirPath: string
}): T.Effect<unknown, UnknownFSError, string[]> => {
  const filePathPattern = '**/*.{md,mdx,json,yaml,yml}'
  return T.tryCatchPromise(
    () => glob(filePathPattern, { cwd: contentDirPath }),
    (error) => new UnknownFSError({ error }),
  )
}
