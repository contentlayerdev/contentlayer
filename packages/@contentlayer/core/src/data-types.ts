export type Document = Record<string, any> & DocumentMeta

export type NestedDocument = Record<string, any> & Omit<DocumentMeta, '_id'>

export type DocumentMeta = {
  /**
   * Either coming from API-based CMS or based on the local file path
   * Optional concept as no system/workflow depends on IDs.
   */
  _id: string
  _raw: RawDocumentData
}

export type RawDocumentData = Record<string, any>

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

/**
 * ISO 8601 Date string
 *
 * @example '2021-01-01T00:00:00.000Z'
 *
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
 *
 */
export type IsoDateTimeString = string

export type ImageFieldData = {
  /** Image file path relative to `contentDirPath` */
  filePath: string
  /** Image file path relative to document */
  relativeFilePath: string
  width: number
  height: number
  /** `width` / `height` (see https://en.wikipedia.org/wiki/Aspect_ratio_(image)) */
  aspectRatio: number
  format: string
  blurhashDataUrl: string
  /**
   * Alt text for the image
   *
   * Can be provided via ...
   *   - JSON: `"myImageField": { "alt": "My alt text", "src": "my-image.jpg" }`
   *   - YAML / Frontmatter:
   *     ```yaml
   *     # ...
   *     myImageField:
   *       alt: My alt text
   *       src: my-image.jpg
   *     ```
   */
  alt?: string
}
