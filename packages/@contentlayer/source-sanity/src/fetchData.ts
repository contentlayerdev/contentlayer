// NOTE sanity currently doesn't provide ESM exports, thus the require syntax is needed
const SantityImageUrlBuilder = require('@sanity/image-url')
// import SantityImageUrlBuilder from '@sanity/image-url'
import type * as Core from '@contentlayer/core'
import { Cache } from '@contentlayer/core'
import { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder'
import { getSanityClient } from './sanity-client'
import type * as Sanity from './sanity-types'

export const fetchData = async ({
  studioDirPath,
  schemaDef,
  force,
  previousCache,
}: {
  studioDirPath: string
  schemaDef: Core.SchemaDef
  force: boolean
  previousCache: Cache | undefined
}): Promise<Cache> => {
  const client = await getSanityClient(studioDirPath)

  const imageUrlBuilder = SantityImageUrlBuilder(client)

  const { _updatedAt }: { _updatedAt: string } = await client.fetch('*[] | order(_updatedAt desc) [0]{_updatedAt}')
  const lastUpdateInMs = new Date(_updatedAt).getTime()

  if (force || previousCache === undefined || lastUpdateInMs > previousCache.lastUpdateInMs) {
    const entries: Sanity.DataDocument[] = await client.fetch('*[]')
    // TODO overlay drafts -> ids: draft.__original_id__

    // ;(await import('fs')).writeFileSync('entries.json', JSON.stringify(entries, null, 2))

    const documents = entries
      // Ignores documents that are not explicitly defined in the schema (e.g. assets which are accessed via URLs instead)
      .filter((_) => _._type in schemaDef.documentDefMap)
      .map((rawDocumentData) =>
        makeDocument({
          rawDocumentData,
          documentDef: schemaDef.documentDefMap[rawDocumentData._type],
          schemaDef,
          imageUrlBuilder,
        }),
      )

    return { documents, lastUpdateInMs }
  }

  return { documents: previousCache.documents, lastUpdateInMs: previousCache.lastUpdateInMs }
}

const makeDocument = ({
  rawDocumentData,
  documentDef,
  schemaDef,
  imageUrlBuilder,
}: {
  rawDocumentData: Sanity.DataDocument
  documentDef: Core.DocumentDef
  schemaDef: Core.SchemaDef
  imageUrlBuilder: ImageUrlBuilder
}): Core.Document => {
  const raw = Object.fromEntries(Object.entries(rawDocumentData).filter(([key]) => key.startsWith('_')))
  const doc: Core.Document = { _typeName: documentDef.name, _id: rawDocumentData._id, _raw: raw }

  documentDef.fieldDefs.forEach((fieldDef) => {
    doc[fieldDef.name] = getDataForFieldDef({
      fieldDef,
      rawFieldData: rawDocumentData[fieldDef.name],
      schemaDef,
      imageUrlBuilder,
    })
  })

  return doc
}

const makeObject = ({
  rawObjectData,
  fieldDefs,
  typeName,
  schemaDef,
  imageUrlBuilder,
}: {
  rawObjectData: Sanity.DataObject
  /** Passing `FieldDef[]` here instead of `ObjectDef` in order to also support `inline_object` */
  fieldDefs: Core.FieldDef[]
  typeName: string
  schemaDef: Core.SchemaDef
  imageUrlBuilder: ImageUrlBuilder
}): Core.Object => {
  const raw = Object.fromEntries(Object.entries(rawObjectData).filter(([key]) => key.startsWith('_')))
  const obj: Core.Object = { _typeName: typeName, _raw: raw }

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
    if (fieldDef.required) {
      console.error(`Inconsistent data found: ${fieldDef}`)
    }

    return undefined
  }

  switch (fieldDef.type) {
    case 'object':
      const objectDef = schemaDef.objectDefMap[fieldDef.objectName]
      return makeObject({
        rawObjectData: rawFieldData,
        fieldDefs: objectDef.fieldDefs,
        typeName: objectDef.name,
        schemaDef,
        imageUrlBuilder,
      })
    case 'inline_object':
      return makeObject({
        rawObjectData: rawFieldData,
        fieldDefs: fieldDef.fieldDefs,
        typeName: 'inline_object',
        schemaDef,
        imageUrlBuilder,
      })
    case 'reference':
      return rawFieldData._ref
    case 'image':
      return imageUrlBuilder.image(rawFieldData).url()
    case 'polymorphic_list':
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
  fieldDef: Core.ListFieldDef | Core.PolymorphicListFieldDef
  schemaDef: Core.SchemaDef
  imageUrlBuilder: ImageUrlBuilder
}): any => {
  if (typeof rawItemData === 'string') {
    return rawItemData
  }

  // polymorphic list case
  if (rawItemData._type in schemaDef.objectDefMap) {
    const objectDef = schemaDef.objectDefMap[rawItemData._type]
    return makeObject({
      rawObjectData: rawItemData,
      fieldDefs: objectDef.fieldDefs,
      typeName: objectDef.name,
      schemaDef,
      imageUrlBuilder,
    })
  }

  if (fieldDef.type === 'list' && fieldDef.of.type === 'inline_object') {
    return makeObject({
      rawObjectData: rawItemData,
      fieldDefs: fieldDef.of.fieldDefs,
      typeName: 'inline_object',
      schemaDef,
      imageUrlBuilder,
    })
  }

  throw new Error(`Case unhandled. Raw data: ${JSON.stringify(rawItemData, null, 2)}`)
}
