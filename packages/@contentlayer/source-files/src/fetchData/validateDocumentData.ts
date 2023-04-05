import type * as core from '@contentlayer/core'
import type { AbsolutePosixFilePath, RelativePosixFilePath } from '@contentlayer/utils'
import { filePathJoin, fs } from '@contentlayer/utils'
import { O, OT, pipe, T, These } from '@contentlayer/utils/effect'
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
  HasDocumentTypeMapState & OT.HasTracer & fs.HasFs,
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

      const requiredFieldError = validateRequiredFieldValues({
        rawFieldValues: rawContent.fields,
        documentFilePath: relativeFilePath,
        documentTypeDef,
        fieldDefs: documentTypeDef.fieldDefs,
      })

      if (O.isSome(requiredFieldError)) {
        return These.fail(requiredFieldError.value)
      }

      const warningOption = validateExtraFieldValues({
        fieldDefs: documentTypeDef.fieldDefs,
        rawFieldValues: rawContent.fields,
        options,
        documentTypeDef,
        documentFilePath: relativeFilePath,
      })

      for (const fieldDef of documentTypeDef.fieldDefs) {
        const fieldValidOption = yield* $(
          validateFieldData({
            documentFilePath: relativeFilePath,
            documentTypeDef,
            fieldDef,
            coreSchemaDef,
            rawFieldData: rawContent.fields[fieldDef.name],
            contentDirPath,
          }),
        )

        if (O.isSome(fieldValidOption)) {
          return These.fail(fieldValidOption.value)
        }
      }

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
  coreSchemaDef,
  documentTypeDef,
  contentDirPath,
}: {
  fieldDef: core.FieldDef
  rawFieldData: any
  documentFilePath: RelativePosixFilePath
  /** Only needed for error handling */
  documentTypeDef: core.DocumentTypeDef
  coreSchemaDef: core.SchemaDef
  contentDirPath: AbsolutePosixFilePath
}): T.Effect<
  OT.HasTracer & fs.HasFs,
  never,
  O.Option<
    | FetchDataError.IncompatibleFieldDataError
    | FetchDataError.ReferencedFileDoesNotExistError
    | FetchDataError.MissingRequiredFieldsError
  >
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
        return O.none
      case 'nested_unnamed':
      case 'nested': {
        const nestedFieldDefs =
          fieldDef.type === 'nested_unnamed'
            ? fieldDef.typeDef.fieldDefs
            : coreSchemaDef.nestedTypeDefMap[fieldDef.nestedTypeName]!.fieldDefs

        const nestedFieldError = validateRequiredFieldValues({
          documentFilePath,
          documentTypeDef,
          fieldDefs: nestedFieldDefs,
          rawFieldValues: rawFieldData,
        })

        if (O.isSome(nestedFieldError)) return nestedFieldError

        // TODO also check for extra fields (but this will require a refactor)

        for (const fieldDef of nestedFieldDefs) {
          const fieldValidOption = yield* $(
            validateFieldData({
              documentFilePath,
              documentTypeDef,
              coreSchemaDef,
              fieldDef,
              rawFieldData: rawFieldData[fieldDef.name],
              contentDirPath,
            }),
          )

          if (O.isSome(fieldValidOption)) {
            return fieldValidOption
          }
        }

        return O.none
      }
      case 'nested_polymorphic': // TODO
      // TODO validate whether data has correct type (probably via zod)
      default:
        return O.none
    }
  })['|>'](T.orDie)

const validateRequiredFieldValues = ({
  rawFieldValues,
  fieldDefs,
  documentTypeDef,
  documentFilePath,
}: {
  rawFieldValues: Record<string, any>
  fieldDefs: core.FieldDef[]
  /** Only needed for error handling - TODO make more specific when called with nested type defs */
  documentTypeDef: core.DocumentTypeDef
  /** Only needed for error handling */
  documentFilePath: RelativePosixFilePath
}) => {
  const existingDataFieldKeys = Object.keys(rawFieldValues)

  const requiredFieldsWithoutDefaultValue = fieldDefs.filter(
    (_) => _.isRequired && _.default === undefined && _.isSystemField === false,
  )
  const misingRequiredFieldDefs = requiredFieldsWithoutDefaultValue.filter(
    (fieldDef) => !existingDataFieldKeys.includes(fieldDef.name),
  )
  if (misingRequiredFieldDefs.length > 0) {
    return O.some(
      new FetchDataError.MissingRequiredFieldsError({
        documentFilePath,
        documentTypeDef,
        fieldDefsWithMissingData: misingRequiredFieldDefs,
      }),
    )
  }

  return O.none
}

const validateExtraFieldValues = ({
  rawFieldValues,
  fieldDefs,
  options,
  documentTypeDef,
  documentFilePath,
}: {
  rawFieldValues: Record<string, any>
  fieldDefs: core.FieldDef[]
  options: core.PluginOptions
  /** Only needed for error handling - TODO make more specific when called with nested type defs */
  documentTypeDef: core.DocumentTypeDef
  /** Only needed for error handling */
  documentFilePath: RelativePosixFilePath
}) => {
  const existingDataFieldKeys = Object.keys(rawFieldValues)

  // warn about data fields not defined in the schema
  const typeFieldName = options.fieldOptions.typeFieldName
  // NOTE we also need to add the system-level type name field to the list of existing data fields
  const schemaFieldNames = fieldDefs.map((_) => _.name).concat([typeFieldName])
  const extraFieldEntries = existingDataFieldKeys
    .filter((fieldKey) => !schemaFieldNames.includes(fieldKey))
    .map((fieldKey) => [fieldKey, rawFieldValues[fieldKey]] as const)

  if (extraFieldEntries.length > 0) {
    return O.some(
      new FetchDataError.ExtraFieldDataError({
        documentFilePath,
        extraFieldEntries,
        documentTypeDef,
      }),
    )
  }

  return O.none
}

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
