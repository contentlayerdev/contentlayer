export type Cache = {
  /** SHA1 hash of the `documents` data (e.g. for caching) */
  hash: string
  documents: DocumentBase[]
}

export type DocumentBase = {
  __meta: DocumentMeta
  __computed?: Record<string, any>
} & Record<string, any>

export type DocumentMeta = {
  /**
   * Either coming from API-based CMS or based on the local file path
   * Optional concept as no system/workflow depends on IDs.
   */
  // id: string
  typeName: string
  // urlPath: string
  sourceFilePath: string
}
