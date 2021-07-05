import type * as Core from '@contentlayer/core'
import type { Cache, Markdown, MDX } from '@contentlayer/core'
import { bundleMDX } from '@contentlayer/core'
import { markdownToHtml } from '@contentlayer/core'
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
}): Promise<Cache> => {
  const contentTypes = await environment.getContentTypes()

  const schemaOverrides = normalizeSchemaOverrides({
    contentTypes: contentTypes.items,
    schemaOverrides: schemaOverrides_,
  })

  const allEntries = await getAllEntries(environment)

  const allAssets = await getAllAssets(environment)

  if (process.env['CL_DEBUG']) {
    ;(await import('fs')).writeFileSync('.tmp.assets.json', JSON.stringify(allAssets, null, 2))
    ;(await import('fs')).writeFileSync('.tmp.entries.json', JSON.stringify(allEntries, null, 2))
  }

  const documents = await Promise.all(
    Object.values(schemaDef.documentDefMap).flatMap((documentDef) =>
      allEntries
        .filter((_) => schemaOverrides.documentTypes[_.sys.contentType.sys.id]?.defName === documentDef.name)
        .map((documentEntry) =>
          makeDocument({ documentEntry, allEntries, allAssets, documentDef, schemaDef, schemaOverrides }),
        ),
    ),
  )

  const cacheItemsMap = Object.fromEntries(documents.map((_) => [_.document._id, _]))

  return { cacheItemsMap }
})['|>'](traceAsyncFn('@contentlayer/source-contentlayer/fetchData:fetchAllDocuments'))

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

const makeDocument = async ({
  documentEntry,
  allEntries,
  allAssets,
  documentDef,
  schemaDef,
  schemaOverrides,
}: {
  documentEntry: Contentful.Entry
  allEntries: Contentful.Entry[]
  allAssets: Contentful.Asset[]
  documentDef: Core.DocumentDef
  schemaDef: Core.SchemaDef
  schemaOverrides: SchemaOverrides.Normalized.SchemaOverrides
}): Promise<Core.Document> => {
  const docValues = await promiseMapToDict(
    documentDef.fieldDefs,
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
  const doc: Core.Document = { _typeName: documentDef.name, _id: documentEntry.sys.id, _raw: raw, ...docValues }

  return doc
}

const makeObject = async ({
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
  /** Passing `FieldDef[]` here instead of `ObjectDef` in order to also support `inline_object` */
  fieldDefs: Core.FieldDef[]
  typeName: string
  schemaDef: Core.SchemaDef
  schemaOverrides: SchemaOverrides.Normalized.SchemaOverrides
}): Promise<Core.Object> => {
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

  const obj: Core.Object = { _typeName: typeName, _raw: raw, ...objValues }

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
    if (fieldDef.required) {
      console.error(`Inconsistent data found: ${fieldDef}`)
    }

    return undefined
  }

  switch (fieldDef.type) {
    case 'object':
      const objectDefName = schemaOverrides.objectTypes[fieldDef.objectName].defName
      const objectDef = schemaDef.objectDefMap[objectDefName]
      return makeObject({
        entryId: rawFieldData.sys.id,
        allEntries,
        allAssets,
        fieldDefs: objectDef.fieldDefs,
        typeName: objectDef.name,
        schemaDef,
        schemaOverrides,
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
      return promiseMap(rawFieldData as any[], (rawItemData) =>
        getDataForListItem({ rawItemData, allEntries, allAssets, fieldDef, schemaDef, schemaOverrides }),
      )
    case 'date':
      return new Date(rawFieldData)
    case 'markdown':
      return <Markdown>{
        raw: rawFieldData,
        html: await markdownToHtml({ mdString: rawFieldData /*, options: options?.markdown */ }),
      }
    case 'mdx':
      return <MDX>{
        raw: rawFieldData,
        code: await bundleMDX(rawFieldData),
      }
    case 'boolean':
    case 'string':
    case 'number':
    case 'json':
    case 'slug':
    case 'text':
    case 'url':
    case 'enum':
      return rawFieldData
    default:
      casesHandled(fieldDef)
  }
}

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
  fieldDef: Core.ListFieldDef | Core.PolymorphicListFieldDef
  schemaDef: Core.SchemaDef
  schemaOverrides: SchemaOverrides.Normalized.SchemaOverrides
}): Promise<any> => {
  if (typeof rawItemData === 'string') {
    return rawItemData
  }

  if (rawItemData.sys?.id) {
    // if (rawItemData.sys?.id && rawItemData.sys.id in schemaDef.objectDefMap) {
    const entry = allEntries.find((_) => _.sys.id === rawItemData.sys.id)!
    const typeName = schemaOverrides.objectTypes[entry.sys.contentType.sys.id].defName
    const objectDef = schemaDef.objectDefMap[typeName]
    return makeObject({
      entryId: rawItemData.sys.id,
      allEntries,
      allAssets,
      fieldDefs: objectDef.fieldDefs,
      typeName,
      schemaDef,
      schemaOverrides,
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
      schemaOverrides,
    })
  }

  throw new Error(`Case unhandled. Raw data: ${JSON.stringify(rawItemData, null, 2)}`)
}
