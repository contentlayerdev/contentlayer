import type * as core from '@contentlayer/core'
import type { AbsolutePosixFilePath, RelativePosixFilePath } from '@contentlayer/utils'
import { errorToString, pattern } from '@contentlayer/utils'
import { pipe, T, Tagged } from '@contentlayer/utils/effect'

import { getDocumentContext } from '../fetchData/DocumentContext.js'
import type { DocumentContentType } from '../index.js'
import { handleFetchDataErrors } from './aggregate.js'

export namespace FetchDataError {
  export type FetchDataError =
    | InvalidFrontmatterError
    | InvalidMarkdownFileError
    | InvalidYamlFileError
    | InvalidJsonFileError
    | ImageError
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
    documentTypeDef: core.DocumentTypeDef | undefined
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
    contentDirPath: AbsolutePosixFilePath
    skippingMessage: string
  }) => string

  /** This error category is used in order to let users configure the error handling (e.g. warn, ignore, fail) */
  type AggregatableErrorCategory =
    | 'UnknownDocument'
    | 'ExtraFieldData'
    | 'MissingOrIncompatibleData'
    | 'Unexpected'
    // TODO maybe "unify" this with another error category?
    | 'SingletonDocumentNotFound'

  export class InvalidFrontmatterError
    extends Tagged('InvalidFrontmatterError')<{
      readonly error: unknown
      readonly documentFilePath: RelativePosixFilePath
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'
    documentTypeDef = undefined

    renderHeadline: RenderHeadline = ({ errorCount, skippingMessage }) =>
      `Invalid frontmatter data found for ${errorCount} documents.${skippingMessage}`

    renderLine = () => `"${this.documentFilePath}" failed with ${errorToString(this.error)}`
  }

  export class InvalidMarkdownFileError
    extends Tagged('InvalidMarkdownFileError')<{
      readonly error: unknown
      readonly documentFilePath: RelativePosixFilePath
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'
    documentTypeDef = undefined

    renderHeadline: RenderHeadline = ({ errorCount, skippingMessage }) =>
      `Invalid markdown in ${errorCount} documents.${skippingMessage}`

    renderLine = () => `"${this.documentFilePath}" failed with ${errorToString(this.error)}`
  }

  export class InvalidYamlFileError
    extends Tagged('InvalidYamlFileError')<{
      readonly error: unknown
      readonly documentFilePath: RelativePosixFilePath
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'
    documentTypeDef = undefined

    renderHeadline: RenderHeadline = ({ errorCount, skippingMessage }) =>
      `Invalid YAML data in ${errorCount} documents.${skippingMessage}`

    renderLine = () => `"${this.documentFilePath}" failed with ${errorToString(this.error)}`
  }

  export class InvalidJsonFileError
    extends Tagged('InvalidJsonFileError')<{
      readonly error: unknown
      readonly documentFilePath: RelativePosixFilePath
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'
    documentTypeDef = undefined

    renderHeadline: RenderHeadline = ({ errorCount, skippingMessage }) =>
      `Invalid JSON data in ${errorCount} documents.${skippingMessage}`

    renderLine = () => `"${this.documentFilePath}" failed with ${errorToString(this.error)}`
  }

  export class ImageError
    extends Tagged('ImageError')<{
      readonly error: unknown
      readonly documentFilePath: RelativePosixFilePath
      readonly fieldDef: core.FieldDef
      readonly imagePath: string
      readonly documentTypeDef: core.DocumentTypeDef
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'

    renderHeadline: RenderHeadline = ({ errorCount, skippingMessage }) =>
      `Error for ${errorCount} image fields.${skippingMessage}`

    renderLine = () =>
      `"${this.documentFilePath}" with field "${this.fieldDef.name}: ${this.imagePath}" failed with ${errorToString(
        this.error,
      )}`
  }

  export class ComputedValueError
    extends Tagged('ComputedValueError')<{
      readonly error: unknown
      readonly documentFilePath: RelativePosixFilePath
      readonly documentTypeDef: core.DocumentTypeDef
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'

    renderHeadline: RenderHeadline = ({ errorCount, skippingMessage }) =>
      `Error during computed field exection for ${errorCount} documents.${skippingMessage}`

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
    documentTypeDef = undefined
    renderHeadline: RenderHeadline = ({ errorCount, skippingMessage }) =>
      `Found unsupported file extensions for ${errorCount} documents.${skippingMessage}`

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
    documentTypeDef = undefined
    renderHeadline: RenderHeadline = ({ errorCount, skippingMessage }) =>
      `File extension not compatible with \`contentType\` for ${errorCount} documents.${skippingMessage}`

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
      readonly documentFilePath: RelativePosixFilePath
      readonly typeFieldName: string
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'UnknownDocument'
    documentTypeDef = undefined
    renderHeadline: RenderHeadline = ({ errorCount, options, schemaDef, skippingMessage }) => {
      const validTypeNames = Object.keys(schemaDef.documentTypeDefMap).join(', ')
      return `\
Couldn't determine the document type for ${errorCount} documents.${skippingMessage}

Please either define a filePathPattern for the given document type definition \
or provide a valid value for the type field (i.e. the field "${options.fieldOptions.typeFieldName}" needs to be \
one of the following document type names: ${validTypeNames}).`
    }

    renderLine = () => `${this.documentFilePath}`
  }

  export class NoSuchDocumentTypeError
    extends Tagged('NoSuchDocumentTypeError')<{
      readonly documentTypeName: string
      readonly documentFilePath: RelativePosixFilePath
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'
    documentTypeDef = undefined
    renderHeadline: RenderHeadline = ({ errorCount, schemaDef, skippingMessage }) => {
      const validTypeNames = Object.keys(schemaDef.documentTypeDefMap).join(', ')
      return `\
Couldn't find document type definitions provided by name for ${errorCount} documents.${skippingMessage}

Please use one of the following document type names: ${validTypeNames}.\
`
    }

    renderLine = () => `${this.documentFilePath} (Used type name: "${this.documentTypeName}")`
  }

  export class NoSuchNestedDocumentTypeError
    extends Tagged('NoSuchNestedDocumentTypeError')<{
      readonly nestedTypeName: string
      readonly documentFilePath: RelativePosixFilePath
      readonly fieldName: string
      readonly validNestedTypeNames: readonly string[]
      readonly documentTypeDef: core.DocumentTypeDef
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'
    renderHeadline: RenderHeadline = ({ errorCount, skippingMessage }) => {
      return `\
Couldn't find nested document type definitions provided by name for ${errorCount} documents.${skippingMessage}\
`
    }

    renderLine = () => {
      const validTypeNames = this.validNestedTypeNames.join(', ')
      return `${this.documentFilePath} (Used type name "${this.nestedTypeName}" for field "${this.fieldName}". Please use one of the following nested document type names: ${validTypeNames}`
    }
  }

  export class MissingRequiredFieldsError
    extends Tagged('MissingRequiredFieldsError')<{
      readonly documentFilePath: RelativePosixFilePath
      readonly fieldDefsWithMissingData: core.FieldDef[]
      readonly documentTypeDef: core.DocumentTypeDef
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'

    renderHeadline: RenderHeadline = ({ errorCount, skippingMessage }) =>
      `Missing required fields for ${errorCount} documents.${skippingMessage}`

    renderLine = () => {
      const misingRequiredFieldsStr = this.fieldDefsWithMissingData
        .map((fieldDef) => `  • ${fieldDef.name}: ${fieldDef.type}`)
        .join('\n')

      return `\
"${this.documentFilePath}" (of type "${this.documentTypeDef.name}") is missing the following required fields:
${misingRequiredFieldsStr}\
`
    }
  }

  export class ExtraFieldDataError
    extends Tagged('ExtraFieldDataError')<{
      readonly documentFilePath: RelativePosixFilePath
      readonly extraFieldEntries: readonly (readonly [fieldKey: string, fieldValue: any])[]
      readonly documentTypeDef: core.DocumentTypeDef
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'ExtraFieldData'

    renderHeadline: RenderHeadline = ({ errorCount, skippingMessage }) => `\
  ${errorCount} documents contain field data which isn't defined in the document type definition.${skippingMessage}`

    renderLine = () => {
      const extraFields = this.extraFieldEntries
        .map(([key, value]) => `  • ${key}: ${JSON.stringify(value)}`)
        .join('\n')
      return `"${this.documentFilePath}" of type "${this.documentTypeDef.name}" has the following extra fields:
${extraFields} `
    }
  }

  export class ReferencedFileDoesNotExistError
    extends Tagged('ReferencedFileDoesNotExistError')<{
      readonly documentFilePath: RelativePosixFilePath
      readonly fieldName: string
      readonly referencedFilePath: RelativePosixFilePath
      readonly documentTypeDef: core.DocumentTypeDef
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'

    renderHeadline: RenderHeadline = ({ errorCount, contentDirPath, skippingMessage }) => `\
${errorCount} documents contain file references which don't exist.${skippingMessage}

File paths have to be relative to \`contentDirPath\`: "${contentDirPath}")`

    renderLine = () => {
      return `"${this.documentFilePath}" of type "${this.documentTypeDef.name}" with field "${this.fieldName}" references the file "${this.referencedFilePath}" which doesn't exist.`
    }
  }

  export class IncompatibleFieldDataError
    extends Tagged('IncompatibleFieldDataError')<{
      readonly documentFilePath: RelativePosixFilePath
      readonly incompatibleFieldData: readonly (readonly [fieldKey: string, fieldValue: any])[]
      readonly documentTypeDef: core.DocumentTypeDef
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'MissingOrIncompatibleData'

    renderHeadline: RenderHeadline = ({ errorCount, skippingMessage }) => `\
${errorCount} documents contain field data which didn't match the structure defined in the document type definition.${skippingMessage}`

    renderLine = () => {
      const incompatibleFields = this.incompatibleFieldData
        .map(([key, value]) => `  • ${key}: ${JSON.stringify(value)}`)
        .join('\n')
      return `"${this.documentFilePath}" of type "${this.documentTypeDef.name}" has the following incompatible fields:
${incompatibleFields} `
    }

    static fail = ({
      incompatibleFieldData,
    }: {
      incompatibleFieldData: readonly (readonly [fieldKey: string, fieldValue: any])[]
    }) =>
      pipe(
        getDocumentContext,
        T.chain((documentContext) =>
          T.fail(
            new FetchDataError.IncompatibleFieldDataError({
              documentFilePath: documentContext.relativeFilePath,
              documentTypeDef: documentContext.documentTypeDef,
              incompatibleFieldData,
            }),
          ),
        ),
      )
  }

  export class SingletonDocumentNotFoundError
    extends Tagged('SingletonDocumentNotFoundError')<{
      readonly filePath: string | undefined
      readonly documentTypeDef: core.DocumentTypeDef
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'SingletonDocumentNotFound'

    renderHeadline: RenderHeadline = ({ errorCount }) => `\
Couldn't find a document for ${errorCount} singleton document types`

    renderLine = () => {
      const filePathInfo = this.filePath ? ` at provided file path "${this.filePath}"` : ``
      return `Couldn't find a document for document type "${this.documentTypeDef.name}"${filePathInfo}`
    }
  }

  export class UnexpectedError
    extends Tagged('UnexpectedError')<{
      readonly documentFilePath: RelativePosixFilePath
      readonly error: unknown
    }>
    implements AggregatableError
  {
    category: AggregatableErrorCategory = 'Unexpected'
    documentTypeDef = undefined

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
