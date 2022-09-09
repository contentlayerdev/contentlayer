import type * as core from '@contentlayer/core'
import type { AbsolutePosixFilePath, RelativePosixFilePath } from '@contentlayer/utils'
import { filePathJoin } from '@contentlayer/utils'
import { O, OT, pipe, T, These } from '@contentlayer/utils/effect'
import { fs } from '@contentlayer/utils/node'
import micromatch from 'micromatch'

import { FetchDataError } from '../errors/index.js'
import type { DocumentContentType, FilePathPatternMap } from '../index.js'
import type { ContentTypeMap } from '../types.js'
import type { HasDocumentTypeMapState } from './DocumentTypeMap.js'
import { DocumentTypeMapState } from './DocumentTypeMap.js'
import type { RawContent } from './types.js'

type ValidateDocumentDataError =
  | FetchDataError.CouldNotDetermineDocumentTypeError
  | FetchDataError.NoSuchDocumentTypeError
  | FetchDataError.MissingRequiredFieldsError
  | FetchDataError.ExtraFieldDataError
  | FetchDataError.ReferencedFileDoesNotExistError
  | FetchDataError.IncompatibleFieldDataError
  | FetchDataError.FileExtensionMismatch

export const validateDocumentData = ({
  coreSchemaDef,
  rawContent,
  relativeFilePath,
  filePathPatternMap,
  options,
  contentDirPath,
  contentTypeMap,
}: {
  coreSchemaDef: core.SchemaDef
  rawContent: RawContent
  /** relativeFilePath just needed for better error handling */
  relativeFilePath: RelativePosixFilePath
  filePathPatternMap: FilePathPatternMap
  options: core.PluginOptions
  contentDirPath: AbsolutePosixFilePath
  contentTypeMap: ContentTypeMap
}): T.Effect<
  HasDocumentTypeMapState & OT.HasTracer,
  never,
  These.These<ValidateDocumentDataError, { documentTypeDef: core.DocumentTypeDef }>
> =>
  pipe(
    T.gen(function* ($) {
      const documentDefName = getDocumentDefName({ rawContent, filePathPatternMap, relativeFilePath, options })

      yield* $(OT.addAttribute('documentDefName', documentDefName!))

      if (documentDefName === undefined) {
        const typeFieldName = options.fieldOptions.typeFieldName
        return These.fail(
          new FetchDataError.CouldNotDetermineDocumentTypeError({ documentFilePath: relativeFilePath, typeFieldName }),
        )
      }

      const documentTypeDef = coreSchemaDef.documentTypeDefMap[documentDefName]

      if (documentTypeDef === undefined) {
        return These.fail(
          new FetchDataError.NoSuchDocumentTypeError({
            documentTypeName: documentDefName,
            documentFilePath: relativeFilePath,
          }),
        )
      }

      const contentType = contentTypeMap[documentTypeDef.name]!
      const mismatchError = validateContentTypeMatchesFileExtension({ contentType, relativeFilePath })
      if (mismatchError) return These.fail(mismatchError)

      yield* $(DocumentTypeMapState.update((_) => _.add(documentDefName, relativeFilePath)))

      const existingDataFieldKeys = Object.keys(rawContent.fields)

      // make sure all required fields are present
      const requiredFieldsWithoutDefaultValue = documentTypeDef.fieldDefs.filter(
        (_) => _.isRequired && _.default === undefined && _.isSystemField === false,
      )
      const misingRequiredFieldDefs = requiredFieldsWithoutDefaultValue.filter(
        (fieldDef) => !existingDataFieldKeys.includes(fieldDef.name),
      )
      if (misingRequiredFieldDefs.length > 0) {
        return These.fail(
          new FetchDataError.MissingRequiredFieldsError({
            documentFilePath: relativeFilePath,
            documentTypeDef,
            fieldDefsWithMissingData: misingRequiredFieldDefs,
          }),
        )
      }

      let warningOption: O.Option<ValidateDocumentDataError> = O.none

      // warn about data fields not defined in the schema
      const typeFieldName = options.fieldOptions.typeFieldName
      // NOTE we also need to add the system-level type name field to the list of existing data fields
      const schemaFieldNames = documentTypeDef.fieldDefs.map((_) => _.name).concat([typeFieldName])
      const extraFieldEntries = existingDataFieldKeys
        .filter((fieldKey) => !schemaFieldNames.includes(fieldKey))
        .map((fieldKey) => [fieldKey, rawContent.fields[fieldKey]] as const)

      if (extraFieldEntries.length > 0) {
        const extraFieldDataError = new FetchDataError.ExtraFieldDataError({
          documentFilePath: relativeFilePath,
          extraFieldEntries,
          documentTypeDef,
        })

        warningOption = O.some(extraFieldDataError)
      }

      for (const fieldDef of documentTypeDef.fieldDefs) {
        const fieldValidOption = yield* $(
          validateFieldData({
            documentFilePath: relativeFilePath,
            documentTypeDef,
            fieldDef,
            rawFieldData: rawContent.fields[fieldDef.name],
            contentDirPath,
          }),
        )

        if (O.isSome(fieldValidOption)) {
          return These.fail(fieldValidOption.value)
        }
      }

      // TODO validate nesteds

      return These.warnOption({ documentTypeDef }, warningOption)
    }),
    OT.withSpan('validateDocumentData', { attributes: { relativeFilePath } }),
  )

const getDocumentDefName = ({
  rawContent,
  relativeFilePath,
  filePathPatternMap,
  options,
}: {
  rawContent: RawContent
  relativeFilePath: string
  filePathPatternMap: FilePathPatternMap
  options: core.PluginOptions
}): string | undefined => {
  // first check if provided document has a type field value
  const typeFieldName = options.fieldOptions.typeFieldName
  const typeFieldValue = rawContent.fields[typeFieldName]
  if (typeFieldValue !== undefined) {
    return typeFieldValue
  }

  // otherwise try to see whether one of the document type definitions has a file path pattern
  // that matches the file path
  return getDocumentDefNameByFilePathPattern({ filePathPatternMap, relativeFilePath })
}

const getDocumentDefNameByFilePathPattern = ({
  relativeFilePath,
  filePathPatternMap,
}: {
  relativeFilePath: string
  filePathPatternMap: FilePathPatternMap
}): string | undefined => {
  const matchingFilePathPattern = Object.keys(filePathPatternMap).find((filePathPattern) =>
    micromatch.isMatch(relativeFilePath, filePathPattern, {}),
  )

  if (matchingFilePathPattern) {
    return filePathPatternMap[matchingFilePathPattern]
  }

  return undefined
}

const validateFieldData = ({
  fieldDef,
  rawFieldData,
  documentFilePath,
  documentTypeDef,
  contentDirPath,
}: {
  fieldDef: core.FieldDef
  rawFieldData: any
  documentFilePath: RelativePosixFilePath
  documentTypeDef: core.DocumentTypeDef
  contentDirPath: AbsolutePosixFilePath
}): T.Effect<
  OT.HasTracer,
  never,
  O.Option<FetchDataError.IncompatibleFieldDataError | FetchDataError.ReferencedFileDoesNotExistError>
> =>
  T.gen(function* ($) {
    const dataIsNil = rawFieldData === undefined || rawFieldData === null
    if (dataIsNil && fieldDef.isRequired === false) {
      return O.none
    }

    switch (fieldDef.type) {
      case 'list':
        return Array.isArray(rawFieldData)
          ? O.none
          : O.some(
              new FetchDataError.IncompatibleFieldDataError({
                incompatibleFieldData: [[fieldDef.name, rawFieldData]],
                documentFilePath,
                documentTypeDef,
              }),
            )
      // TODO also check for references in lists
      case 'reference':
        if (typeof rawFieldData === 'string') {
          const fullFilePath = filePathJoin(contentDirPath, rawFieldData)
          const fileExists = yield* $(fs.fileOrDirExists(fullFilePath))
          if (!fileExists) {
            return O.some(
              new FetchDataError.ReferencedFileDoesNotExistError({
                referencedFilePath: rawFieldData as any,
                fieldName: fieldDef.name,
                documentFilePath,
                documentTypeDef,
              }),
            )
          }
        }
      // TODO validate whether data has correct type (probably via zod)
      default:
        return O.none
    }
  })['|>'](T.orDie)

const validateContentTypeMatchesFileExtension = ({
  contentType,
  relativeFilePath,
}: {
  contentType: DocumentContentType
  relativeFilePath: RelativePosixFilePath
}) => {
  const extension = relativeFilePath.toLowerCase().split('.').pop()!

  const validMarkdownExtensions = ['md', 'mdx']
  const isInvalidMarkdownOrMdx =
    (contentType === 'markdown' || contentType === 'mdx') && validMarkdownExtensions.includes(extension) === false

  const validDataExtensions = ['json', 'yaml', 'yml']
  const isInvalidData = contentType === 'data' && validDataExtensions.includes(extension) === false

  if (isInvalidMarkdownOrMdx || isInvalidData) {
    return new FetchDataError.FileExtensionMismatch({ contentType, extension, filePath: relativeFilePath })
  }

  return undefined
}
