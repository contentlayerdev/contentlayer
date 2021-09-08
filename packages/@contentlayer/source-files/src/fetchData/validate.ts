import type * as core from '@contentlayer/core'
import * as Sync from '@effect-ts/core/Sync'
import minimatch from 'minimatch'

import type { FilePathPatternMap, Flags } from '..'
import type { InvalidDataError } from '../errors'
import { CouldNotDetermineDocumentTypeError, MissingRequiredFieldsError, NoSuchDocumentTypeError } from '../errors'
import type { RawContent } from './types'

export const validateDocumentData = ({
  coreSchemaDef,
  rawContent,
  relativeFilePath,
  filePathPatternMap,
  flags,
  options,
}: {
  coreSchemaDef: core.SchemaDef
  rawContent: RawContent
  /** relativeFilePath just needed for better error handling */
  relativeFilePath: string
  filePathPatternMap: FilePathPatternMap
  flags: Flags
  options: core.PluginOptions
}): Sync.Sync<unknown, InvalidDataError, { documentTypeDef: core.DocumentTypeDef }> =>
  Sync.gen(function* ($) {
    const documentDefName = getDocumentDefName({ rawContent, filePathPatternMap, relativeFilePath, options })

    if (documentDefName === undefined) {
      const typeFieldName = options.fieldOptions.typeFieldName
      return yield* $(
        Sync.fail(new CouldNotDetermineDocumentTypeError({ documentFilePath: relativeFilePath, typeFieldName })),
      )
    }

    const documentTypeDef = coreSchemaDef.documentTypeDefMap[documentDefName]

    if (documentTypeDef === undefined) {
      return yield* $(Sync.fail(new NoSuchDocumentTypeError({ documentTypeName: documentDefName })))
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
      return yield* $(
        Sync.fail(
          new MissingRequiredFieldsError({
            documentFilePath: relativeFilePath,
            documentTypeName: documentTypeDef.name,
            fieldDefsWithMissingData: misingRequiredFieldDefs,
          }),
        ),
      )
    }

    // TODO validate whether data has correct type

    // warn about data fields not defined in the schema
    if (flags.onExtraFieldData === 'warn') {
      const typeFieldName = options.fieldOptions.typeFieldName
      // add the type name field to the list of existing data fields
      const schemaFieldNames = documentTypeDef.fieldDefs.map((_) => _.name).concat([typeFieldName])
      const extraFieldKeys = existingDataFieldKeys.filter((fieldKey) => !schemaFieldNames.includes(fieldKey))
      if (extraFieldKeys.length > 0) {
        console.log(`\
Warning: Document (type: "${
          documentTypeDef.name
        }") contained fields that are not defined in schema for "${relativeFilePath}".

Extra fields:
${extraFieldKeys.map((key) => `  ${key}: ${JSON.stringify(rawContent.fields[key])}`).join('\n')}
`)
      }

      // TODO fail case
    }

    // TODO validate nesteds

    return { documentTypeDef }
  })

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
