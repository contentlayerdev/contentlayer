export type Cache = {
  /**
   * A map containing all documents wrapped in a {@link CacheItem} indexed by id.
   * We're using a map/record here (instead of a simple array) since it's easier and more efficient
   * to implement cache operations (e.g. lookup, update, delete) this way.
   */
  cacheItemsMap: { [id: string]: CacheItem }
}

export type CacheItem = {
  document: Document
  /**
   * The `documentHash` is used to determine if a document has changed and it's value-generation is implemented
   * by a given plugin (e.g. based on the last-edit data in source-local)
   */
  documentHash: string
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
