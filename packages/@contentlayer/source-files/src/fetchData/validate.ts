import type * as core from '@contentlayer/core'
import { O, These } from '@contentlayer/utils/effect'
import minimatch from 'minimatch'

import type { FilePathPatternMap } from '..'
import { FetchDataError } from '../errors'
import type { RawContent } from './types'

type ValidateDocumentDataError =
  | FetchDataError.CouldNotDetermineDocumentTypeError
  | FetchDataError.NoSuchDocumentTypeError
  | FetchDataError.MissingRequiredFieldsError
  | FetchDataError.ExtraFieldDataError

export const validateDocumentData = ({
  coreSchemaDef,
  rawContent,
  relativeFilePath,
  filePathPatternMap,
  options,
}: {
  coreSchemaDef: core.SchemaDef
  rawContent: RawContent
  /** relativeFilePath just needed for better error handling */
  relativeFilePath: string
  filePathPatternMap: FilePathPatternMap
  options: core.PluginOptions
}): These.These<ValidateDocumentDataError, { documentTypeDef: core.DocumentTypeDef }> => {
  const documentDefName = getDocumentDefName({ rawContent, filePathPatternMap, relativeFilePath, options })

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
        documentTypeName: documentTypeDef.name,
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
      documentTypeName: documentTypeDef.name,
    })

    warningOption = O.some(extraFieldDataError)
  }

  // TODO validate whether data has correct type (probably via zod)
  // TODO validate nesteds

  return These.warnOption({ documentTypeDef }, warningOption)
}

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
    minimatch(relativeFilePath, filePathPattern),
  )
  if (matchingFilePathPattern) {
    return filePathPatternMap[matchingFilePathPattern]
  }

  return undefined
}
