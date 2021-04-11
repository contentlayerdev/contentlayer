export type Cache = {
  /** SHA1 hash of the `documents` data (e.g. for caching) */
  hash: string
  /** Unix timestamp in milliseconds of the last content change */
  lastUpdateInMs: number
  documents: Document[]
}

export type Document = Record<string, any> & DocumentMeta

export type Object = Record<string, any> & Omit<DocumentMeta, '_id'>

export type DocumentMeta = {
  /**
   * Either coming from API-based CMS or based on the local file path
   * Optional concept as no system/workflow depends on IDs.
   */
  _id: string
  _typeName: string
  _raw?: Record<string, any>
}
