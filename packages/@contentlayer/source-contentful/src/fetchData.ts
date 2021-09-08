import type * as Core from '@contentlayer/core'
import { bundleMDX, markdownToHtml } from '@contentlayer/core'
import { casesHandled, promiseMap, promiseMapToDict, traceAsyncFn } from '@contentlayer/utils'

import type * as SchemaOverrides from './schemaOverrides'
import { normalizeSchemaOverrides } from './schemaOverrides'
import type { Contentful } from './types'

export const fetchAllDocuments = (async ({
  schemaDef,
  environment,
  schemaOverrides: schemaOverrides_,
}: {
  schemaDef: Core.SchemaDef
  environment: Contentful.Environment
  schemaOverrides: SchemaOverrides.Input.SchemaOverrides
}): Promise<Core.Cache> => {
  const contentTypes = await environment.getContentTypes()

  const schemaOverrides = normalizeSchemaOverrides({
    contentTypes: contentTypes.items,
    schemaOverrides: schemaOverrides_,
  })

  // Needs to be done sequencially, because of Contentful's API rate limiting
  const allEntries = await getAllEntries(environment)
  const allAssets = await getAllAssets(environment)

  if (process.env['CL_DEBUG']) {
    ;(await import('fs')).writeFileSync('.tmp.assets.json', JSON.stringify(allAssets, null, 2))
    ;(await import('fs')).writeFileSync('.tmp.entries.json', JSON.stringify(allEntries, null, 2))
  }

  const isEntryADocument = ({
    entry,
    documentTypeDef,
  }: {
    entry: Contentful.Entry
    documentTypeDef: Core.DocumentTypeDef
  }) => schemaOverrides.documentTypes[entry.sys.contentType.sys.id]?.defName === documentTypeDef.name

  const documents = await Promise.all(
    Object.values(schemaDef.documentTypeDefMap).flatMap((documentTypeDef) =>
      allEntries
        .filter((entry) => isEntryADocument({ entry, documentTypeDef }))
        .map((documentEntry) =>
          makeCacheItem({
            documentEntry,
            allEntries,
            allAssets,
            documentTypeDef,
            schemaDef,
            schemaOverrides,
          }),
        ),
    ),
  )

  const cacheItemsMap = Object.fromEntries(documents.map((_) => [_.document._id, _]))

  return { cacheItemsMap }
})['|>'](
  traceAsyncFn('@contentlayer/source-contentlayer/fetchData:fetchAllDocuments', ['schemaDef', 'schemaOverrides']),
)

const getAllEntries = async (environment: Contentful.Environment): Promise<Contentful.Entry[]> => {
  const entries: Contentful.Entry[] = []
  const { total } = await environment.getEntries({ limit: 0 })
  const chunkSize = 500

  for (let offset = 0; offset <= total; offset += chunkSize) {
    const result = await environment.getEntries({ limit: chunkSize, skip: offset })

    entries.push(...result.items)
  }

  return entries
}

const getAllAssets = async (environment: Contentful.Environment): Promise<Contentful.Asset[]> => {
  const assets: Contentful.Asset[] = []
  const { total } = await environment.getEntries({ limit: 0 })
  const chunkSize = 500

  for (let offset = 0; offset <= total; offset += chunkSize) {
    const result = await environment.getAssets({ limit: chunkSize, skip: offset })

    assets.push(...result.items)
  }

  return assets
}

const makeCacheItem = async ({
  documentEntry,
  allEntries,
  allAssets,
  documentTypeDef,
  schemaDef,
  schemaOverrides,
}: {
  documentEntry: Contentful.Entry
  allEntries: Contentful.Entry[]
  allAssets: Contentful.Asset[]
  documentTypeDef: Core.DocumentTypeDef
  schemaDef: Core.SchemaDef
  schemaOverrides: SchemaOverrides.Normalized.SchemaOverrides
}): Promise<Core.CacheItem> => {
  const docValues = await promiseMapToDict(
    documentTypeDef.fieldDefs,
    (fieldDef) =>
      getDataForFieldDef({
        fieldDef,
        allEntries,
        allAssets,
        rawFieldData: documentEntry.fields[fieldDef.name]?.['en-US'],
        schemaDef,
        schemaOverrides,
      }),
    (fieldDef) => fieldDef.name,
  )

  const raw = { sys: documentEntry.sys, metadata: documentEntry.metadata }
  const document: Core.Document = {
    _typeName: documentTypeDef.name,
    _id: documentEntry.sys.id,
    _raw: raw,
    ...docValues,
  }

  const documentHash = documentEntry.sys.updatedAt

  return { document, documentHash }
}

const makeNestedDocument = async ({
  entryId,
  allEntries,
  allAssets,
  fieldDefs,
  typeName,
  schemaDef,
  schemaOverrides,
}: {
  entryId: string
  allEntries: Contentful.Entry[]
  allAssets: Contentful.Asset[]
  /** Passing `FieldDef[]` here instead of `ObjectDef` in order to also support `inline_embedded` */
  fieldDefs: Core.FieldDef[]
  typeName: string
  schemaDef: Core.SchemaDef
  schemaOverrides: SchemaOverrides.Normalized.SchemaOverrides
}): Promise<Core.NestedDocument> => {
  const objectEntry = allEntries.find((_) => _.sys.id === entryId)!
  const raw = { sys: objectEntry.sys, metadata: objectEntry.metadata }

  const objValues = await promiseMapToDict(
    fieldDefs,
    (fieldDef) =>
      getDataForFieldDef({
        fieldDef,
        allEntries,
        allAssets,
        rawFieldData: objectEntry.fields[fieldDef.name]?.['en-US'],
        schemaDef,
        schemaOverrides,
      }),
    (fieldDef) => fieldDef.name,
  )

  const obj: Core.NestedDocument = { _typeName: typeName, _raw: raw, ...objValues }

  return obj
}

const getDataForFieldDef = async ({
  fieldDef,
  allEntries,
  allAssets,
  rawFieldData,
  schemaDef,
  schemaOverrides,
}: {
  fieldDef: Core.FieldDef
  rawFieldData: any
  allEntries: Contentful.Entry[]
  allAssets: Contentful.Asset[]
  schemaDef: Core.SchemaDef
  schemaOverrides: SchemaOverrides.Normalized.SchemaOverrides
}): Promise<any> => {
  if (rawFieldData === undefined) {
    if (fieldDef.isRequired) {
      console.error(`Inconsistent data found: ${fieldDef}`)
    }

    return undefined
  }

  switch (fieldDef.type) {
    case 'nested':
      const nestedTypeDefName = schemaOverrides.objectTypes[fieldDef.nestedTypeName]!.defName
      const nestedTypeDef = schemaDef.nestedTypeDefMap[nestedTypeDefName]!
      return makeNestedDocument({
        entryId: rawFieldData.sys.id,
        allEntries,
        allAssets,
        fieldDefs: nestedTypeDef.fieldDefs,
        typeName: nestedTypeDefName,
        schemaDef,
        schemaOverrides,
      })
    case 'nested_polymorphic':
    case 'nested_unnamed':
      throw new Error(`Doesn't exist in Contentful`)
    case 'reference':
      return rawFieldData.sys.id
    case 'reference_polymorphic':
      throw new Error(`Doesn't exist in Contentful`)
    case 'list_polymorphic':
    case 'list':
      return promiseMap(rawFieldData as any[], (rawItemData) =>
        getDataForListItem({ rawItemData, allEntries, allAssets, fieldDef, schemaDef, schemaOverrides }),
      )
    case 'date':
      return new Date(rawFieldData)
    case 'markdown':
      return <Core.Markdown>{
        raw: rawFieldData,
        html: await markdownToHtml({ mdString: rawFieldData /*, options: options?.markdown */ }),
      }
    case 'mdx':
      return <Core.MDX>{
        raw: rawFieldData,
        code: await bundleMDX(rawFieldData),
      }
    case 'string':
      // e.g. for images
      if (rawFieldDataIsAsset(rawFieldData)) {
        const asset = allAssets.find((_) => _.sys.id === rawFieldData.sys.id)!
        const url = asset.fields.file['en-US']!.url
        // starts with `//`
        return `https:${url}`
      }
      return rawFieldData
    case 'boolean':
    case 'number':
    case 'json':
    case 'enum':
      return rawFieldData
    default:
      casesHandled(fieldDef)
  }
}

type ContentfulAssetEntry = { sys: { type: 'Link'; linkType: 'Asset'; id: string } }
const rawFieldDataIsAsset = (rawFieldData: any): rawFieldData is ContentfulAssetEntry =>
  rawFieldData.sys?.type === 'Link' && rawFieldData.sys?.linkType === 'Asset'

const getDataForListItem = async ({
  rawItemData,
  allEntries,
  allAssets,
  fieldDef,
  schemaDef,
  schemaOverrides,
}: {
  rawItemData: any
  allEntries: Contentful.Entry[]
  allAssets: Contentful.Asset[]
  fieldDef: Core.ListFieldDef | Core.ListPolymorphicFieldDef
  schemaDef: Core.SchemaDef
  schemaOverrides: SchemaOverrides.Normalized.SchemaOverrides
}): Promise<any> => {
  if (typeof rawItemData === 'string') {
    return rawItemData
  }

  if (rawItemData.sys?.id) {
    // if (rawItemData.sys?.id && rawItemData.sys.id in schemaDef.objectDefMap) {
    const entry = allEntries.find((_) => _.sys.id === rawItemData.sys.id)!
    const typeName = schemaOverrides.objectTypes[entry.sys.contentType.sys.id]!.defName
    const nestedTypeDef = schemaDef.nestedTypeDefMap[typeName]!
    return makeNestedDocument({
      entryId: rawItemData.sys.id,
      allEntries,
      allAssets,
      fieldDefs: nestedTypeDef.fieldDefs,
      typeName,
      schemaDef,
      schemaOverrides,
    })
  }

  if (fieldDef.type === 'list' && fieldDef.of.type === 'nested_unnamed') {
    return makeNestedDocument({
      entryId: rawItemData.sys.id,
      allEntries,
      allAssets,
      fieldDefs: fieldDef.of.typeDef.fieldDefs,
      typeName: 'inline_embedded',
      schemaDef,
      schemaOverrides,
    })
  }

  throw new Error(`Case unhandled. Raw data: ${JSON.stringify(rawItemData, null, 2)}`)
}
