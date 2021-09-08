import type * as core from '@contentlayer/core'
import type { FileNotFoundError, ReadFileError, UnknownFSError } from '@contentlayer/utils/node'
import { Tagged } from '@effect-ts/core/Case'

export {}

export class ComputedValueError extends Tagged('ComputedValueError')<{ readonly error: unknown }> {}

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
  toString = () => `\
Couldn't find document type definition for file "${this.documentFilePath}"

Please either provide a valid value for the type field ("${this.typeFieldName}")
or define a filePathPattern for the given document type definition.`
}

export class NoSuchDocumentTypeError extends Tagged('NoSuchDocumentTypeError')<{
  readonly documentTypeName: string
}> {
  toString = () => `\
No such document type definition: "${this.documentTypeName}"`
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

export class InvalidDataDuringMappingError extends Tagged('InvalidDataDuringMappingError')<{
  readonly documentFilePath: string
  readonly message: string
}> {}

export type InvalidDataError =
  | NoSuchDocumentTypeError
  | CouldNotDetermineDocumentTypeError
  | MissingRequiredFieldsError
  | InvalidDataDuringMappingError

export type FetchDataError =
  | ReadFileError
  | UnknownFSError
  | FileNotFoundError
  | ComputedValueError
  | UnsupportedFileExtension
  | InvalidDataError
