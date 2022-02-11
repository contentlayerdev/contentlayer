import type * as core from '@contentlayer/core'
import type { PosixFilePath } from '@contentlayer/utils'
import { errorToString, pattern } from '@contentlayer/utils'
import { Tagged } from '@contentlayer/utils/effect'

import type { DocumentContentType } from '../index.js'
import { handleFetchDataErrors } from './aggregate.js'

export namespace FetchDataError {
  export type FetchDataError =
    | InvalidFrontmatterError
    | InvalidMarkdownFileError
    | InvalidYamlFileError
    | InvalidJsonFileError
    | ComputedValueError
    | UnsupportedFileExtension
    | FileExtensionMismatch
    | NoSuchDocumentTypeError
    | NoSuchNestedDocumentTypeError
    | CouldNotDetermineDocumentTypeError
    | MissingRequiredFieldsError
    | ExtraFieldDataError
    | ReferencedFileDoesNotExistError
    | IncompatibleFieldDataError
    | SingletonDocumentNotFoundError
    | UnexpectedError

  interface AggregatableError {
    renderHeadline: RenderHeadline
    renderLine: () => string
    category: AggregatableErrorCategory
  }

  export const handleErrors = handleFetchDataErrors

  type RenderHeadline = (_: {
    /**
     * `errorCount` is mostly equivalent with the number of erroneous documents
     * but in some cases (e.g. `SingletonDocumentNotFoundError`) can be independent of a certain document
     */
    errorCount: number
    options: core.PluginOptions
    schemaDef: core.SchemaDef
    contentDirPath: PosixFilePath
  }) => string

  /** This error category is used in order to let users configure the error handling (e.g. warn, ignore, fail) */
  type AggregatableErrorCategory =
    | 'UnknownDocument'
    | 'ExtraFieldData'
    | 'IncompatibleFieldData'
    | 'MissingOrIncompatibleData'
    | 'Unexpected'
    // TODO maybe "unify" this with another error category?
    | 'SingletonDocumentNotFound'

  export class InvalidFrontmatterError
    extends Tagged('InvalidFrontmatterError')<{
      readonly error: unknown
      readonly documentFilePath: PosixFilePath
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'

    renderHeadline: RenderHeadline = ({ errorCount }) => `Invalid frontmatter data found for ${errorCount} documents.`

    renderLine = () => `"${this.documentFilePath}" failed with ${errorToString(this.error)}`
  }

  export class InvalidMarkdownFileError
    extends Tagged('InvalidMarkdownFileError')<{
      readonly error: unknown
      readonly documentFilePath: PosixFilePath
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'

    renderHeadline: RenderHeadline = ({ errorCount }) => `Invalid markdown in ${errorCount} documents.`

    renderLine = () => `"${this.documentFilePath}" failed with ${errorToString(this.error)}`
  }

  export class InvalidYamlFileError
    extends Tagged('InvalidYamlFileError')<{
      readonly error: unknown
      readonly documentFilePath: PosixFilePath
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'

    renderHeadline: RenderHeadline = ({ errorCount }) => `Invalid YAML data in ${errorCount} documents.`

    renderLine = () => `"${this.documentFilePath}" failed with ${errorToString(this.error)}`
  }

  export class InvalidJsonFileError
    extends Tagged('InvalidJsonFileError')<{
      readonly error: unknown
      readonly documentFilePath: PosixFilePath
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'

    renderHeadline: RenderHeadline = ({ errorCount }) => `Invalid JSON data in ${errorCount} documents.`

    renderLine = () => `"${this.documentFilePath}" failed with ${errorToString(this.error)}`
  }

  export class ComputedValueError
    extends Tagged('ComputedValueError')<{
      readonly error: unknown
      readonly documentFilePath: PosixFilePath
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'

    renderHeadline: RenderHeadline = ({ errorCount }) =>
      `Error during computed field exection for ${errorCount} documents.`

    renderLine = () => `"${this.documentFilePath}" failed with ${errorToString(this.error)}`
  }

  export class UnsupportedFileExtension
    extends Tagged('UnsupportedFileExtension')<{
      readonly extension: string
      readonly filePath: string
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'
    renderHeadline: RenderHeadline = ({ errorCount }) => `Found unsupported file extensions for ${errorCount} documents`

    renderLine = () => `"${this.filePath}" uses "${this.extension}"`
  }

  export class FileExtensionMismatch
    extends Tagged('FileExtensionMismatch')<{
      readonly extension: string
      readonly contentType: DocumentContentType
      readonly filePath: string
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'
    renderHeadline: RenderHeadline = ({ errorCount }) =>
      `File extension not compatible with \`contentType\` for ${errorCount} documents`

    renderLine = () => {
      const expectedFileExtensions = pattern
        .match(this.contentType)
        .with('markdown', () => ['md', 'mdx'])
        .with('mdx', () => ['mdx', 'mdx'])
        .with('data', () => ['json', 'yaml', 'yml'])
        .exhaustive()

      return `"${this.filePath}" ends with "${this.extension}" but expected to be one of "${expectedFileExtensions.join(
        ', ',
      )}" as defined \`contentType\` is "${this.contentType}"`
    }
  }

  export class CouldNotDetermineDocumentTypeError
    extends Tagged('CouldNotDetermineDocumentTypeError')<{
      readonly documentFilePath: PosixFilePath
      readonly typeFieldName: string
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'UnknownDocument'
    renderHeadline: RenderHeadline = ({ errorCount, options, schemaDef }) => {
      const validTypeNames = Object.keys(schemaDef.documentTypeDefMap).join(', ')
      return `\
Couldn't determine the document type for ${errorCount} documents.

Please either define a filePathPattern for the given document type definition \
or provide a valid value for the type field (i.e. the field "${options.fieldOptions.typeFieldName}" needs to be \
one of the following document type names: ${validTypeNames}).`
    }

    renderLine = () => `${this.documentFilePath}`
  }

  export class NoSuchDocumentTypeError
    extends Tagged('NoSuchDocumentTypeError')<{
      readonly documentTypeName: string
      readonly documentFilePath: PosixFilePath
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'
    renderHeadline: RenderHeadline = ({ errorCount, schemaDef }) => {
      const validTypeNames = Object.keys(schemaDef.documentTypeDefMap).join(', ')
      return `\
Couldn't find document type definitions provided by name for ${errorCount} documents.

Please use one of the following document type names: ${validTypeNames}.\
`
    }

    renderLine = () => `${this.documentFilePath} (Used type name: "${this.documentTypeName}")`
  }

  export class NoSuchNestedDocumentTypeError
    extends Tagged('NoSuchNestedDocumentTypeError')<{
      readonly documentTypeName: string
      readonly documentFilePath: PosixFilePath
      readonly fieldName: string
      readonly validNestedTypeNames: readonly string[]
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'
    renderHeadline: RenderHeadline = ({ errorCount }) => {
      return `\
Couldn't find nested document type definitions provided by name for ${errorCount} documents.\
`
    }

    renderLine = () => {
      const validTypeNames = this.validNestedTypeNames.join(', ')
      return `${this.documentFilePath} (Used type name "${this.documentTypeName}" for field "${this.fieldName}". Please use one of the following nested document type names: ${validTypeNames}`
    }
  }

  export class MissingRequiredFieldsError
    extends Tagged('MissingRequiredFieldsError')<{
      readonly documentFilePath: PosixFilePath
      readonly documentTypeName: string
      readonly fieldDefsWithMissingData: core.FieldDef[]
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'

    renderHeadline: RenderHeadline = ({ errorCount }) => `Missing required fields for ${errorCount} documents`

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
      readonly documentFilePath: PosixFilePath
      readonly documentTypeName: string
      readonly extraFieldEntries: readonly (readonly [fieldKey: string, fieldValue: any])[]
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'ExtraFieldData'

    renderHeadline: RenderHeadline = ({ errorCount }) => `\
  ${errorCount} documents contain field data which isn't defined in the document type definition`

    renderLine = () => {
      const extraFields = this.extraFieldEntries
        .map(([key, value]) => `  • ${key}: ${JSON.stringify(value)}`)
        .join('\n')
      return `"${this.documentFilePath}" of type "${this.documentTypeName}" has the following extra fields:
${extraFields} `
    }
  }

  export class ReferencedFileDoesNotExistError
    extends Tagged('ReferencedFileDoesNotExistError')<{
      readonly documentFilePath: PosixFilePath
      readonly documentTypeName: string
      readonly fieldName: string
      readonly referencedFilePath: PosixFilePath
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'IncompatibleFieldData'

    renderHeadline: RenderHeadline = ({ errorCount, contentDirPath }) => `\
${errorCount} documents contain file references which don't exist (file paths have to be relative to \`contentDirPath\`: "${contentDirPath}")`

    renderLine = () => {
      return `"${this.documentFilePath}" of type "${this.documentTypeName}" with field "${this.fieldName}" references the file "${this.referencedFilePath}" which doesn't exist.`
    }
  }

  export class IncompatibleFieldDataError
    extends Tagged('IncompatibleFieldDataError')<{
      readonly documentFilePath: PosixFilePath
      readonly documentTypeName: string
      readonly incompatibleFieldData: readonly (readonly [fieldKey: string, fieldValue: any])[]
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'IncompatibleFieldData'

    renderHeadline: RenderHeadline = ({ errorCount }) => `\
${errorCount} documents contain field data which didn't match the structure defined in the document type definition`

    renderLine = () => {
      const incompatibleFields = this.incompatibleFieldData
        .map(([key, value]) => `  • ${key}: ${JSON.stringify(value)}`)
        .join('\n')
      return `"${this.documentFilePath}" of type "${this.documentTypeName}" has the following incompatible fields:
${incompatibleFields} `
    }
  }

  export class SingletonDocumentNotFoundError
    extends Tagged('SingletonDocumentNotFoundError')<{
      readonly documentTypeName: string
      readonly filePath: string | undefined
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'SingletonDocumentNotFound'

    renderHeadline: RenderHeadline = ({ errorCount }) => `\
Couldn't find a document for ${errorCount} singleton document types`

    renderLine = () => {
      const filePathInfo = this.filePath ? ` at provided file path "${this.filePath}"` : ``
      return `Couldn't find a document for document type "${this.documentTypeName}"${filePathInfo}`
    }
  }

  export class UnexpectedError
    extends Tagged('UnexpectedError')<{
      readonly documentFilePath: PosixFilePath
      readonly error: unknown
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'Unexpected'

    renderHeadline: RenderHeadline = ({ errorCount }) => `\
Encountered unexpected errors while processing of ${errorCount} documents. \
This is possibly a bug in Contentlayer. Please open an issue.`

    renderLine = () => `"${this.documentFilePath}": ${errorToString(this.error)}`
  }
}

export type SchemaError = DuplicateBodyFieldError

export class DuplicateBodyFieldError extends Tagged('DuplicateBodyFieldError')<{
  readonly bodyFieldName: string
}> {
  toString = () => `You cannot override the "${this.bodyFieldName}" field in a document definition.`
}
