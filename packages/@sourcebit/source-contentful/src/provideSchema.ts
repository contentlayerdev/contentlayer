import type * as Core from '@sourcebit/core'
import type * as Contentful from './contentful-types'
import { partition } from './utils'

export const provideSchema = async (environment: Contentful.Environment): Promise<Core.SchemaDef> => {
  const contentTypes = await environment.getContentTypes()

  const isReferencedMap: { [contentTypeName: string]: boolean } = {}
  contentTypes.items
    .flatMap((_) => _.fields)
    .forEach((field) => {
      console.log({ field: field.name, linkType: field.linkType, validation: JSON.stringify(field.validations) })
      if (field.validations?.[0]?.linkContentType) {
        field.validations[0].linkContentType.forEach((linkContentType) => {
          isReferencedMap[linkContentType] = true
        })
      } else if (field.linkType) {
        // isReferencedMap[field.linkType] = true
      } else if (field.items?.type === 'Link' && field.items.validations?.[0]?.linkContentType) {
        field.items.validations[0].linkContentType.forEach((linkContentType) => {
          isReferencedMap[linkContentType] = true
        })
      }
    })

  console.log({ isReferencedMap })

  const [objectContentTypes, documentContentTypes] = partition(contentTypes.items, (_) => isReferencedMap[_.sys.id])

  console.log({
    documentTypes: documentContentTypes.map((_) => _.name),
    objectTypes: objectContentTypes.map((_) => _.name),
  })

  // contentTypes.items[0].fields[0].
  const documentDefMap = {}
  const objectDefMap = {}
  return { documentDefMap, objectDefMap }
}
