import type * as core from '@contentlayer/core'
import { Tagged } from '@contentlayer/utils/effect'
import type { FileNotFoundError, ReadFileError, UnknownFSError } from '@contentlayer/utils/node'

export class ComputedValueError extends Tagged('ComputedValueError')<{ readonly error: unknown }> {
  toString = () => `ComputedValueError: ${this.error}`
}

export type RenderHeadline = (_: {
  documentCount: number
  options: core.PluginOptions
  schemaDef: core.SchemaDef
}) => string

export class UnsupportedFileExtension extends Tagged('UnsupportedFileExtension')<{
  readonly extension: string
  readonly filePath: string
}> {
  toString = () => `Unsupported file extension "${this.extension}" for ${this.filePath}`
}

export class CouldNotDetermineDocumentTypeError extends Tagged('CouldNotDetermineDocumentTypeError')<{
  readonly documentFilePath: string
  readonly typeFieldName: string
}> {
  static renderHeadline: RenderHeadline = ({ documentCount, options, schemaDef }) => {
    const validTypeNames = Object.keys(schemaDef.documentTypeDefMap).join(', ')
    return `\
Couldn't determine the document type for ${documentCount} documents.

Please either define a filePathPattern for the given document type definition \
or provide a valid value for the type field (i.e. the field "${options.fieldOptions.typeFieldName}" needs to be \
one of the following document type names: ${validTypeNames}).`
  }

  renderLine = () => `${this.documentFilePath}`
}

export class NoSuchDocumentTypeError extends Tagged('NoSuchDocumentTypeError')<{
  readonly documentTypeName: string
  readonly documentFilePath: string
}> {
  static renderHeadline: RenderHeadline = ({ documentCount, schemaDef }) => {
    const validTypeNames = Object.keys(schemaDef.documentTypeDefMap).join(', ')
    return `\
Couldn't find document type definitions provided by name for ${documentCount} documents.

Please use one of the following document type names: ${validTypeNames}.`
  }

  renderLine = () => `${this.documentFilePath} (Used type name: "${this.documentTypeName}")`
}

export class MissingRequiredFieldsError extends Tagged('MissingRequiredFieldsError')<{
  readonly documentFilePath: string
  readonly documentTypeName: string
  readonly fieldDefsWithMissingData: core.FieldDef[]
}> {
  toString = () => {
    const misingRequiredFieldsStr = this.fieldDefsWithMissingData
      .map((fieldDef, i) => `     ${i + 1}) ${fieldDef.name}: ${fieldDef.type}`)
      .join('\n')

    return `\
Missing required fields (type: "${this.documentTypeName}") for "${this.documentFilePath}".
  Missing fields:
${misingRequiredFieldsStr}`
  }
}

export class ExtraFieldDataError extends Tagged('ExtraFieldDataError')<{
  readonly documentFilePath: string
  readonly documentTypeName: string
  readonly extraFieldEntries: readonly (readonly [fieldKey: string, fieldValue: any])[]
}> {
  toString = () => {
    return `\
Warning: Document (type: "${this.documentTypeName}") contained fields that are not defined in schema for "${
      this.documentFilePath
    }".

Extra fields:
${this.extraFieldEntries.map(([key, value]) => `  ${key}: ${JSON.stringify(value)}`).join('\n')}
`
  }
}

export class InvalidDataDuringMappingError extends Tagged('InvalidDataDuringMappingError')<{
  readonly documentFilePath: string
  readonly message: string
}> {
  toString = () => `ComputedValueError: ${this.message}`
}

export type InvalidDataError =
  | NoSuchDocumentTypeError
  | CouldNotDetermineDocumentTypeError
  | MissingRequiredFieldsError
  | InvalidDataDuringMappingError
  | ExtraFieldDataError

export type FetchDataError =
  | ReadFileError
  | UnknownFSError
  | FileNotFoundError
  | ComputedValueError
  | UnsupportedFileExtension
  | InvalidDataError

export type SchemaError = DuplicateBodyFieldError

export class DuplicateBodyFieldError extends Tagged('DuplicateBodyFieldError')<{
  readonly bodyFieldName: string
}> {
  toString = () => `You cannot override the "${this.bodyFieldName}" field in a document definition.`
}
