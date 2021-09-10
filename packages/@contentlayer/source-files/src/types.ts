import type * as unified from 'unified'

import type { DocumentBodyType } from './schema/defs'

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

export type Flags = {
  /**
   * Whether to skip, fail or ignore when encountering document files which can't be mapped
   * to a document type.
   *
   * @default 'skip-warn'
   */
  onUnknownDocuments: 'skip-warn' | 'skip-ignore' | 'fail'

  /**
   * Whether to print warning meassages if a document has field values
   * which are not definied in the document definition
   *
   * @default 'warn'
   */
  onExtraFieldData: 'warn' | 'ignore' | 'fail'

  /**
   * Whether to skip, fail or ignore when encountering missing or incompatible data
   *
   * @default 'skip-warn'
   */
  onMissingOrIncompatibleData: 'skip-warn' | 'skip-ignore' | 'fail'
}
