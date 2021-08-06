export type Document = Record<string, any> & DocumentMeta

export type NestedDocument = Record<string, any> & Omit<DocumentMeta, '_id'>

export type DocumentMeta = {
  /**
   * Either coming from API-based CMS or based on the local file path
   * Optional concept as no system/workflow depends on IDs.
   */
  _id: string
  // _typeName: string
  _raw: Record<string, any>
}

export type Markdown = {
  /** Raw Markdown source */
  raw: string
  /** Generated HTML based on Markdown source */
  html: string
}

export type MDX = {
  /** Raw MDX source */
  raw: string
  /** Prebundled via mdx-bundler */
  code: string
}
