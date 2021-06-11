import type { DocumentFileType } from './schema'

type DocumentDefName = string
type FilePathPattern = string
export type FilePathPatternMap = Record<DocumentDefName, FilePathPattern>

export type RawDocumentData = {
  sourceFilePath: string
  sourceFileName: string
  sourceFileDir: string
  fileType: DocumentFileType
  /** A path e.g. useful as URL paths based on `sourceFilePath` with file extension removed and `/index` removed. */
  flattenedPath: string
}
