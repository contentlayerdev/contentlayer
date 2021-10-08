import type * as core from '@contentlayer/core'
import { errorToString } from '@contentlayer/utils'
import { Tagged } from '@contentlayer/utils/effect'

import { handleFetchDataErrors } from './aggregate.js'

export namespace FetchDataError {
  export type FetchDataError =
    | InvalidFrontmatterError
    | InvalidMarkdownFileError
    | InvalidYamlFileError
    | InvalidJsonFileError
    | ComputedValueError
    | UnsupportedFileExtension
    | NoSuchDocumentTypeError
    | CouldNotDetermineDocumentTypeError
    | MissingRequiredFieldsError
    | ExtraFieldDataError
    | UnexpectedError

  interface AggregatableError {
    renderHeadline: RenderHeadline
    renderLine: () => string
    kind: InvalidDataErrorKind
  }

  export const handleErrors = handleFetchDataErrors

  type RenderHeadline = (_: { documentCount: number; options: core.PluginOptions; schemaDef: core.SchemaDef }) => string

  type InvalidDataErrorKind = 'UnknownDocument' | 'ExtraFieldData' | 'MissingOrIncompatibleData' | 'Unexpected'

  export class InvalidFrontmatterError
    extends Tagged('InvalidFrontmatterError')<{
      readonly error: unknown
      readonly documentFilePath: string
    }>
    implements AggregatableError
  {
    kind: InvalidDataErrorKind = 'MissingOrIncompatibleData'

    renderHeadline: RenderHeadline = ({ documentCount }) =>
      `Invalid frontmatter data found for ${documentCount} documents.`

    renderLine = () => `"${this.documentFilePath}" failed with ${errorToString(this.error)}`
  }

  export class InvalidMarkdownFileError
    extends Tagged('InvalidMarkdownFileError')<{
      readonly error: unknown
      readonly documentFilePath: string
    }>
    implements AggregatableError
  {
    kind: InvalidDataErrorKind = 'MissingOrIncompatibleData'

    renderHeadline: RenderHeadline = ({ documentCount }) => `Invalid markdown in ${documentCount} documents.`

    renderLine = () => `"${this.documentFilePath}" failed with ${errorToString(this.error)}`
  }

  export class InvalidYamlFileError
    extends Tagged('InvalidYamlFileError')<{
      readonly error: unknown
      readonly documentFilePath: string
    }>
    implements AggregatableError
  {
    kind: InvalidDataErrorKind = 'MissingOrIncompatibleData'

    renderHeadline: RenderHeadline = ({ documentCount }) => `Invalid YAML data in ${documentCount} documents.`

    renderLine = () => `"${this.documentFilePath}" failed with ${errorToString(this.error)}`
  }

  export class InvalidJsonFileError
    extends Tagged('InvalidJsonFileError')<{
      readonly error: unknown
      readonly documentFilePath: string
    }>
    implements AggregatableError
  {
    kind: InvalidDataErrorKind = 'MissingOrIncompatibleData'

    renderHeadline: RenderHeadline = ({ documentCount }) => `Invalid JSON data in ${documentCount} documents.`

    renderLine = () => `"${this.documentFilePath}" failed with ${errorToString(this.error)}`
  }

  export class ComputedValueError
    extends Tagged('ComputedValueError')<{
      readonly error: unknown
      readonly documentFilePath: string
    }>
    implements AggregatableError
  {
    kind: InvalidDataErrorKind = 'MissingOrIncompatibleData'

    renderHeadline: RenderHeadline = ({ documentCount }) =>
      `Error during computed field exection for ${documentCount} documents.`

    renderLine = () => `"${this.documentFilePath}" failed with ${errorToString(this.error)}`
  }

  export class UnsupportedFileExtension
    extends Tagged('UnsupportedFileExtension')<{
      readonly extension: string
      readonly filePath: string
    }>
    implements AggregatableError
  {
    kind: InvalidDataErrorKind = 'MissingOrIncompatibleData'
    renderHeadline: RenderHeadline = ({ documentCount }) =>
      `Found unsupported file extensions for ${documentCount} documents`

    renderLine = () => `"${this.filePath}" uses "${this.extension}"`
  }

  export class CouldNotDetermineDocumentTypeError
    extends Tagged('CouldNotDetermineDocumentTypeError')<{
      readonly documentFilePath: string
      readonly typeFieldName: string
    }>
    implements AggregatableError
  {
    kind: InvalidDataErrorKind = 'UnknownDocument'
    renderHeadline: RenderHeadline = ({ documentCount, options, schemaDef }) => {
      const validTypeNames = Object.keys(schemaDef.documentTypeDefMap).join(', ')
      return `\
Couldn't determine the document type for ${documentCount} documents.

Please either define a filePathPattern for the given document type definition \
or provide a valid value for the type field (i.e. the field "${options.fieldOptions.typeFieldName}" needs to be \
one of the following document type names: ${validTypeNames}).`
    }

    renderLine = () => `${this.documentFilePath}`
  }

  export class NoSuchDocumentTypeError
    extends Tagged('NoSuchDocumentTypeError')<{
      readonly documentTypeName: string
      readonly documentFilePath: string
    }>
    implements AggregatableError
  {
    kind: InvalidDataErrorKind = 'MissingOrIncompatibleData'
    renderHeadline: RenderHeadline = ({ documentCount, schemaDef }) => {
      const validTypeNames = Object.keys(schemaDef.documentTypeDefMap).join(', ')
      return `\
Couldn't find document type definitions provided by name for ${documentCount} documents.

Please use one of the following document type names: ${validTypeNames}.\
`
    }

    renderLine = () => `${this.documentFilePath} (Used type name: "${this.documentTypeName}")`
  }

  export class MissingRequiredFieldsError
    extends Tagged('MissingRequiredFieldsError')<{
      readonly documentFilePath: string
      readonly documentTypeName: string
      readonly fieldDefsWithMissingData: core.FieldDef[]
    }>
    implements AggregatableError
  {
    kind: InvalidDataErrorKind = 'MissingOrIncompatibleData'

    renderHeadline: RenderHeadline = ({ documentCount }) => `Missing required fields for ${documentCount} documents`

    renderLine = () => {
      const misingRequiredFieldsStr = this.fieldDefsWithMissingData
        .map((fieldDef) => `  • ${fieldDef.name}: ${fieldDef.type}`)
        .join('\n')

      return `\
"${this.documentFilePath}" is missing the following required fields:
${misingRequiredFieldsStr}\
`
    }
  }

  export class ExtraFieldDataError
    extends Tagged('ExtraFieldDataError')<{
      readonly documentFilePath: string
      readonly documentTypeName: string
      readonly extraFieldEntries: readonly (readonly [fieldKey: string, fieldValue: any])[]
    }>
    implements AggregatableError
  {
    kind: InvalidDataErrorKind = 'ExtraFieldData'

    renderHeadline: RenderHeadline = ({ documentCount }) => `\
  ${documentCount} documents contain field data which isn't defined in the document type definition`

    renderLine = () => {
      const extraFields = this.extraFieldEntries
        .map(([key, value]) => `  • ${key}: ${JSON.stringify(value)}`)
        .join('\n')
      return `"${this.documentFilePath}" of type "${this.documentTypeName}" has the following extra fields:
${extraFields} `
    }
  }

  export class UnexpectedError
    extends Tagged('UnexpectedError')<{
      readonly documentFilePath: string
      readonly error: unknown
    }>
    implements AggregatableError
  {
    kind: InvalidDataErrorKind = 'Unexpected'

    renderHeadline: RenderHeadline = ({ documentCount }) => `\
Encountered unexpected errors while processing of ${documentCount} documents. \
This is possibly a bug in Contentlayer. Please open an issue.`

    renderLine = () => `"${this.documentFilePath}": ${errorToString(this.error)}`
  }
}

export class InvalidDataDuringMappingError extends Tagged('InvalidDataDuringMappingError')<{
  readonly message: string
}> {
  toString = () => `Found inconsistent data. ${this.message}`
}

export type SchemaError = DuplicateBodyFieldError

export class DuplicateBodyFieldError extends Tagged('DuplicateBodyFieldError')<{
  readonly bodyFieldName: string
}> {
  toString = () => `You cannot override the "${this.bodyFieldName}" field in a document definition.`
}
