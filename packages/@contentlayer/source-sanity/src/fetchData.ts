// NOTE sanity currently doesn't provide ESM exports, thus the require syntax is needed
const SantityImageUrlBuilder = require('@sanity/image-url')
// import SantityImageUrlBuilder from '@sanity/image-url'
import type * as Core from '@contentlayer/core'
import type { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder'

import { getSanityClient } from './sanity-client'
import type * as Sanity from './sanity-types'

export const fetchData = async ({
  studioDirPath,
  schemaDef,
}: {
  studioDirPath: string
  schemaDef: Core.SchemaDef
}): Promise<Core.DataCache.Cache> => {
  const client = await getSanityClient(studioDirPath)

  const imageUrlBuilder = SantityImageUrlBuilder(client)

  const { _updatedAt }: { _updatedAt: string } = await client.fetch('*[] | order(_updatedAt desc) [0]{_updatedAt}')
  // const lastUpdateInMs = new Date(_updatedAt).getTime()

  // if (force || previousCache === undefined || lastUpdateInMs > previousCache.lastUpdateInMs) {
  const entries: Sanity.DataDocument[] = await client.fetch('*[]')
  // TODO overlay drafts -> ids: draft.__original_id__

  // ;(await import('fs')).writeFileSync('entries.json', JSON.stringify(entries, null, 2))

  const documents = entries
    // Ignores documents that are not explicitly defined in the schema (e.g. assets which are accessed via URLs instead)
    .filter((_) => _._type in schemaDef.documentTypeDefMap)
    .map((rawDocumentData) =>
      makeDocument({
        rawDocumentData,
        documentTypeDef: schemaDef.documentTypeDefMap[rawDocumentData._type]!,
        schemaDef,
        imageUrlBuilder,
      }),
    )

  const cacheItemsMap = Object.fromEntries(documents.map((_) => [_.document._id, _]))

  return { cacheItemsMap }
  // }

  // return { documents: previousCache.documents, lastUpdateInMs: previousCache.lastUpdateInMs }
}

const makeDocument = ({
  rawDocumentData,
  documentTypeDef,
  schemaDef,
  imageUrlBuilder,
}: {
  rawDocumentData: Sanity.DataDocument
  documentTypeDef: Core.DocumentTypeDef
  schemaDef: Core.SchemaDef
  imageUrlBuilder: ImageUrlBuilder
}): Core.Document => {
  const raw = Object.fromEntries(Object.entries(rawDocumentData).filter(([key]) => key.startsWith('_')))
  const doc: Core.Document = { _typeName: documentTypeDef.name, _id: rawDocumentData._id, _raw: raw }

  documentTypeDef.fieldDefs.forEach((fieldDef) => {
    doc[fieldDef.name] = getDataForFieldDef({
      fieldDef,
      rawFieldData: rawDocumentData[fieldDef.name],
      schemaDef,
      imageUrlBuilder,
    })
  })

  return doc
}

const makeNestedDocument = ({
  rawObjectData,
  fieldDefs,
  typeName,
  schemaDef,
  imageUrlBuilder,
}: {
  rawObjectData: Sanity.DataObject
  /** Passing `FieldDef[]` here instead of `ObjectDef` in order to also support `inline_embedded` */
  fieldDefs: Core.FieldDef[]
  typeName: string
  schemaDef: Core.SchemaDef
  imageUrlBuilder: ImageUrlBuilder
}): Core.NestedDocument => {
  const raw = Object.fromEntries(Object.entries(rawObjectData).filter(([key]) => key.startsWith('_')))
  const obj: Core.NestedDocument = { _typeName: typeName, _raw: raw }

  fieldDefs.forEach((fieldDef) => {
    obj[fieldDef.name] = getDataForFieldDef({
      fieldDef,
      rawFieldData: rawObjectData[fieldDef.name],
      schemaDef,
      imageUrlBuilder,
    })
  })

  return obj
}

const getDataForFieldDef = ({
  fieldDef,
  rawFieldData,
  schemaDef,
  imageUrlBuilder,
}: {
  fieldDef: Core.FieldDef
  rawFieldData: any
  schemaDef: Core.SchemaDef
  imageUrlBuilder: ImageUrlBuilder
}): any => {
  if (rawFieldData === undefined) {
    if (fieldDef.isRequired) {
      console.error(`Inconsistent data found: ${fieldDef}`)
    }

    return undefined
  }

  switch (fieldDef.type) {
    case 'nested':
      const objectDef = schemaDef.nestedTypeDefMap[fieldDef.nestedTypeName]!
      return makeNestedDocument({
        rawObjectData: rawFieldData,
        fieldDefs: objectDef.fieldDefs,
        typeName: objectDef.name,
        schemaDef,
        imageUrlBuilder,
      })
    case 'nested_unnamed':
      return makeNestedDocument({
        rawObjectData: rawFieldData,
        fieldDefs: fieldDef.typeDef.fieldDefs,
        typeName: '__UNNAMED__',
        schemaDef,
        imageUrlBuilder,
      })
    case 'reference':
      return rawFieldData._ref
    // TODO images are currently broken
    // case 'image':
    //   return imageUrlBuilder.image(rawFieldData).url()
    case 'list_polymorphic':
    case 'list':
      return (rawFieldData as any[]).map((rawItemData) =>
        getDataForListItem({ rawItemData, fieldDef, schemaDef, imageUrlBuilder }),
      )
    default:
      return rawFieldData
  }
}

const getDataForListItem = ({
  rawItemData,
  fieldDef,
  schemaDef,
  imageUrlBuilder,
}: {
  rawItemData: any
  fieldDef: Core.ListFieldDef | Core.ListPolymorphicFieldDef
  schemaDef: Core.SchemaDef
  imageUrlBuilder: ImageUrlBuilder
}): any => {
  if (typeof rawItemData === 'string') {
    return rawItemData
  }

  // polymorphic list case
  if (rawItemData._type in schemaDef.nestedTypeDefMap) {
    const nestedTypeDef = schemaDef.nestedTypeDefMap[rawItemData._type]!
    return makeNestedDocument({
      rawObjectData: rawItemData,
      fieldDefs: nestedTypeDef.fieldDefs,
      typeName: nestedTypeDef.name,
      schemaDef,
      imageUrlBuilder,
    })
  }

  if (fieldDef.type === 'list' && fieldDef.of.type === 'nested_unnamed') {
    return makeNestedDocument({
      rawObjectData: rawItemData,
      fieldDefs: fieldDef.of.typeDef.fieldDefs,
      typeName: '__UNNAMED__',
      schemaDef,
      imageUrlBuilder,
    })
  }

  throw new Error(`Case unhandled. Raw data: ${JSON.stringify(rawItemData, null, 2)}`)
}
