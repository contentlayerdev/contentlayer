import type * as unified from 'unified'

import type { DocumentBodyType } from './schema'

type DocumentDefName = string
type FilePathPattern = string
export type FilePathPatternMap = Record<FilePathPattern, DocumentDefName>

export type RawDocumentData = {
  sourceFilePath: string
  sourceFileName: string
  sourceFileDir: string
  bodyType: DocumentBodyType
  /** A path e.g. useful as URL paths based on `sourceFilePath` with file extension removed and `/index` removed. */
  flattenedPath: string
}

export type PluginOptions = {
  markdown?: MarkdownOptions
  mdx?: MarkdownOptions
  fieldOptions?: FieldOptions
}

export type MarkdownOptions = {
  remarkPlugins?: unified.Pluggable[]
  rehypePlugins?: unified.Pluggable[]
}

export type FieldOptions = {
  /**
   * Name of the field containing the body/content extracted when `bodyType` is `markdown` or `mdx`.
   * @default "body"
   */
  bodyFieldName?: string
  /**
   * Name of the field containing the name of the document type (or nested document type).
   * @default "type"
   */
  typeFieldName?: string
}
