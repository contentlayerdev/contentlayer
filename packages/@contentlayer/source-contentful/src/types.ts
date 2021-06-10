import * as Contentful from 'contentful-management/types'

export { Contentful }

export type RawDocumentData = {
  sys: Contentful.EntityMetaSysProps
  metadata: Contentful.MetadataProps
}
