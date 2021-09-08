import type * as core from '@contentlayer/core'
import * as utils from '@contentlayer/utils'
import type { FileNotFoundError, ReadFileError } from '@contentlayer/utils/node'
import { fs, UnknownFSError } from '@contentlayer/utils/node'
import { Chunk, pipe } from '@effect-ts/core'
import * as T from '@effect-ts/core/Effect'
import * as OT from '@effect-ts/otel'
import { promise as glob } from 'glob-promise'
import matter from 'gray-matter'
import * as yaml from 'js-yaml'
import * as os from 'os'
import * as path from 'path'

import type { Flags } from '..'
import type { CouldNotDetermineDocumentTypeError, FetchDataError, InvalidDataError } from '../errors'
import { ComputedValueError, UnsupportedFileExtension } from '../errors'
import type { FilePathPatternMap } from '../types'
import { makeDocumentEff } from './mapping'
import type { RawContent } from './types'
import { validateDocumentData } from './validate'

export const fetchAllDocuments = ({
  coreSchemaDef,
  filePathPatternMap,
  contentDirPath,
  flags,
  options,
  previousCache,
}: {
  coreSchemaDef: core.SchemaDef
  filePathPatternMap: FilePathPatternMap
  contentDirPath: string
  flags: Flags
  options: core.PluginOptions
  previousCache: core.Cache | undefined
}): T.Effect<OT.HasTracer, FetchDataError, core.Cache> =>
  T.gen(function* ($) {
    const allRelativeFilePaths = yield* $(getAllRelativeFilePaths({ contentDirPath }))

    const concurrencyLimit = os.cpus().length

    const documents = yield* $(
      pipe(
        allRelativeFilePaths,
        T.forEachParN(concurrencyLimit, (relativeFilePath) =>
          makeCacheItemFromFilePathEff({
            relativeFilePath,
            filePathPatternMap,
            coreSchemaDef: coreSchemaDef,
            contentDirPath,
            flags,
            options,
            previousCache,
          }),
        ),
        T.map(Chunk.filter(utils.isNotUndefined)),
        T.map(Chunk.toArray),
      ),
    )

    const cacheItemsMap = Object.fromEntries(documents.map((_) => [_.document._id, _]))

    return { cacheItemsMap }
  })['|>'](OT.withSpan('@contentlayer/source-local/fetchData:fetchAllDocuments', { attributes: {} }))

export const makeCacheItemFromFilePathEff = ({
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
}): T.Effect<OT.HasTracer, FetchDataError, core.CacheItem | undefined> =>
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
        return previousCache.cacheItemsMap[relativeFilePath]
      }

      const rawContent = yield* $(getRawContent({ fullFilePath, relativeFilePath }))

      const { documentTypeDef } = yield* $(
        validateDocumentData({
          rawContent,
          relativeFilePath,
          coreSchemaDef,
          filePathPatternMap,
          flags,
          options,
        }),
      )

      const document = yield* $(
        makeDocumentEff({
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

      return { document, documentHash }
    }),
    T.catchTag('CouldNotDetermineDocumentTypeError', handleUnknownDocuments(flags)),
    T.catchTag('NoSuchDocumentTypeError', handleInvalidDataError(flags)),
    T.catchTag('MissingRequiredFieldsError', handleInvalidDataError(flags)),
    T.catchTag('InvalidDataDuringMappingError', handleInvalidDataError(flags)),
    OT.withSpan('@contentlayer/source-local/fetchData:makeDocumentFromFilePath'),
  )

const handleInvalidDataError =
  (flags: Flags) =>
  <E extends InvalidDataError>(error: E): T.Effect<unknown, E, undefined> => {
    switch (flags.onMissingOrIncompatibleData) {
      case 'skip-warn':
        console.log(`Skipping document. Reason: ${error.toString()}`)
        return T.succeed(undefined)
      case 'skip-ignore':
        return T.succeed(undefined)
      case 'fail':
        return T.fail(error)
    }
  }

const handleUnknownDocuments =
  (flags: Flags) =>
  <E extends CouldNotDetermineDocumentTypeError>(error: E): T.Effect<unknown, E, undefined> => {
    switch (flags.onUnknownDocuments) {
      case 'skip-warn':
        console.log(`Skipping document. Reason: ${error.toString()}`)
        return T.succeed(undefined)
      case 'skip-ignore':
        return T.succeed(undefined)
      case 'fail':
        return T.fail(error)
    }
  }

const getRawContent = ({
  fullFilePath,
  relativeFilePath,
}: {
  fullFilePath: string
  relativeFilePath: string
}): T.Effect<OT.HasTracer, UnsupportedFileExtension | FileNotFoundError | ReadFileError, RawContent> =>
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
  })['|>'](OT.withSpan('@contentlayer/source-local/fetchData:getRawContent'))

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
    utils.effectUtils.forEachParDict({
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
