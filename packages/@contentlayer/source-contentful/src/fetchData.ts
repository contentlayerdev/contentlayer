import type * as Core from '@contentlayer/core'
import { Cache } from '@contentlayer/core'
import { assertUnreachable } from '@contentlayer/utils'
import type * as Contentful from './contentful-types'

export const fetchData = async ({
  schemaDef,
  force,
  previousCache,
  environment,
}: {
  schemaDef: Core.SchemaDef
  force: boolean
  // TOOD use previous cache
  previousCache: Cache | undefined
  environment: Contentful.Environment
}): Promise<Cache> => {
  const allEntries = await getAllEntries(environment)

  // ;(await import('fs')).writeFileSync('.tmp.entries.json', JSON.stringify(allEntries, null, 2))

  const allAssets = await getAllAssets(environment)

  // ;(await import('fs')).writeFileSync('.tmp.assets.json', JSON.stringify(assets, null, 2))

  /*

  - for each schema documentdef, collect and traverse/embed all entries
  */

  const documents = Object.values(schemaDef.documentDefMap).flatMap((documentDef) =>
    allEntries
      .filter((_) => _.sys.contentType.sys.id === documentDef.name)
      .map((documentEntry) => makeDocument({ documentEntry, allEntries, allAssets, documentDef, schemaDef })),
  )

  return { documents, lastUpdateInMs: 0 }

  // const imageUrlBuilder = SantityImageUrlBuilder(client)

  // const { _updatedAt }: { _updatedAt: string } = await client.fetch('*[] | order(_updatedAt desc) [0]{_updatedAt}')
  // const lastUpdateInMs = new Date(_updatedAt).getTime()

  // if (force || previousCache === undefined || lastUpdateInMs > previousCache.lastUpdateInMs) {
  //   const entries: Sanity.DataDocument[] = await client.fetch('*[]')

  //   // ;(await import('fs')).writeFileSync('entries.json', JSON.stringify(entries, null, 2))

  //   const documents = entries
  //     // Ignores documents that are not explicitly defined in the schema (e.g. assets which are accessed via URLs instead)
  //     .filter((_) => _._type in schemaDef.documentDefMap)
  //     .map((rawDocumentData) =>
  //       makeDocument({
  //         rawDocumentData,
  //         documentDef: schemaDef.documentDefMap[rawDocumentData._type],
  //         schemaDef,
  //         imageUrlBuilder,
  //       }),
  //     )

  //   return { documents, lastUpdateInMs }
  // }

  // return { documents: previousCache.documents, lastUpdateInMs: previousCache.lastUpdateInMs }
}

const getAllEntries = async (environment: Contentful.Environment): Promise<Contentful.Entry[]> => {
  let entries: Contentful.Entry[] = []
  const { total } = await environment.getEntries({ limit: 0 })
  const chunkSize = 500

  for (let offset = 0; offset <= total; offset += chunkSize) {
    const result = await environment.getEntries({ limit: chunkSize, skip: offset })

    entries.push(...result.items)
  }

  return entries
}

const getAllAssets = async (environment: Contentful.Environment): Promise<Contentful.Asset[]> => {
  let assets: Contentful.Asset[] = []
  const { total } = await environment.getEntries({ limit: 0 })
  const chunkSize = 500

  for (let offset = 0; offset <= total; offset += chunkSize) {
    const result = await environment.getAssets({ limit: chunkSize, skip: offset })

    assets.push(...result.items)
  }

  return assets
}

const makeDocument = ({
  documentEntry,
  allEntries,
  allAssets,
  documentDef,
  schemaDef,
}: {
  documentEntry: Contentful.Entry
  allEntries: Contentful.Entry[]
  allAssets: Contentful.Asset[]
  documentDef: Core.DocumentDef
  schemaDef: Core.SchemaDef
}): Core.Document => {
  const raw = { sys: documentEntry.sys, metadata: documentEntry.metadata }
  const doc: Core.Document = { _typeName: documentDef.name, _id: documentEntry.sys.id, _raw: raw }

  documentDef.fieldDefs.forEach((fieldDef) => {
    doc[fieldDef.name] = getDataForFieldDef({
      fieldDef,
      allEntries,
      allAssets,
      rawFieldData: documentEntry.fields[fieldDef.name]?.['en-US'],
      schemaDef,
    })
  })

  return doc
}

const makeObject = ({
  entryId,
  allEntries,
  allAssets,
  fieldDefs,
  typeName,
  schemaDef,
}: {
  entryId: string
  allEntries: Contentful.Entry[]
  allAssets: Contentful.Asset[]
  /** Passing `FieldDef[]` here instead of `ObjectDef` in order to also support `inline_object` */
  fieldDefs: Core.FieldDef[]
  typeName: string
  schemaDef: Core.SchemaDef
}): Core.Object => {
  const objectEntry = allEntries.find((_) => _.sys.id === entryId)!
  const raw = { sys: objectEntry.sys, metadata: objectEntry.metadata }
  const obj: Core.Object = { _typeName: typeName, _raw: raw }

  fieldDefs.forEach((fieldDef) => {
    obj[fieldDef.name] = getDataForFieldDef({
      fieldDef,
      allEntries,
      allAssets,
      rawFieldData: objectEntry.fields[fieldDef.name]?.['en-US'],
      schemaDef,
    })
  })

  return obj
}

const getDataForFieldDef = ({
  fieldDef,
  allEntries,
  allAssets,
  rawFieldData,
  schemaDef,
}: {
  fieldDef: Core.FieldDef
  rawFieldData: any
  allEntries: Contentful.Entry[]
  allAssets: Contentful.Asset[]
  schemaDef: Core.SchemaDef
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
        entryId: rawFieldData.sys.id,
        allEntries,
        allAssets,
        fieldDefs: objectDef.fieldDefs,
        typeName: objectDef.name,
        schemaDef,
      })
    case 'inline_object':
      throw new Error(`Doesn't exist in Contentful`)
    case 'reference':
      return rawFieldData.sys.id
    case 'image':
      const asset = allAssets.find((_) => _.sys.id === rawFieldData.sys.id)!
      const url = asset.fields.file['en-US'].url
      // starts with `//`
      return `https:${url}`
    case 'polymorphic_list':
    case 'list':
      return (rawFieldData as any[]).map((rawItemData) =>
        getDataForListItem({ rawItemData, allEntries, allAssets, fieldDef, schemaDef }),
      )
    case 'date':
      return new Date(rawFieldData)
    case 'boolean':
    case 'string':
    case 'number':
    case 'json':
    case 'slug':
    case 'markdown':
    case 'text':
    case 'url':
    case 'enum':
      return rawFieldData
    default:
      assertUnreachable(fieldDef)
  }
}

const getDataForListItem = ({
  rawItemData,
  allEntries,
  allAssets,
  fieldDef,
  schemaDef,
}: {
  rawItemData: any
  allEntries: Contentful.Entry[]
  allAssets: Contentful.Asset[]
  fieldDef: Core.ListFieldDef | Core.PolymorphicListFieldDef
  schemaDef: Core.SchemaDef
}): any => {
  if (typeof rawItemData === 'string') {
    return rawItemData
  }

  if (rawItemData.sys?.id) {
    // if (rawItemData.sys?.id && rawItemData.sys.id in schemaDef.objectDefMap) {
    const entry = allEntries.find((_) => _.sys.id === rawItemData.sys.id)!
    const typeName = entry.sys.contentType.sys.id
    const objectDef = schemaDef.objectDefMap[typeName]
    return makeObject({
      entryId: rawItemData.sys.id,
      allEntries,
      allAssets,
      fieldDefs: objectDef.fieldDefs,
      typeName,
      schemaDef,
    })
  }

  if (fieldDef.type === 'list' && fieldDef.of.type === 'inline_object') {
    return makeObject({
      entryId: rawItemData.sys.id,
      allEntries,
      allAssets,
      fieldDefs: fieldDef.of.fieldDefs,
      typeName: 'inline_object',
      schemaDef,
    })
  }

  throw new Error(`Case unhandled. Raw data: ${JSON.stringify(rawItemData, null, 2)}`)
}
