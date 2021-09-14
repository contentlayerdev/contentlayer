import type * as Core from '@contentlayer/core'
import { bundleMDX, markdownToHtml } from '@contentlayer/core'
import type { HashError } from '@contentlayer/utils'
import { casesHandled, hashObject } from '@contentlayer/utils'
import type { OT } from '@contentlayer/utils/effect'
import { T } from '@contentlayer/utils/effect'

import type * as SchemaOverrides from '../schemaOverrides'
import type { Contentful } from '../types'

type MakeDocumentError = Core.MarkdownError | Core.MDXError | HashError

export const makeCacheItem = ({
  documentEntry,
  allEntries,
  allAssets,
  documentTypeDef,
  schemaDef,
  schemaOverrides,
  options,
}: {
  documentEntry: Contentful.Entry
  allEntries: Contentful.Entry[]
  allAssets: Contentful.Asset[]
  documentTypeDef: Core.DocumentTypeDef
  schemaDef: Core.SchemaDef
  schemaOverrides: SchemaOverrides.Normalized.SchemaOverrides
  options: Core.PluginOptions
}): T.Effect<OT.HasTracer, MakeDocumentError, Core.CacheItem> =>
  T.gen(function* ($) {
    // TODO also handle custom body field name
    const { typeFieldName } = options.fieldOptions
    const docValues = yield* $(
      T.forEachParDict_(documentTypeDef.fieldDefs, {
        mapValue: (fieldDef) =>
          getDataForFieldDef({
            fieldDef,
            allEntries,
            allAssets,
            rawFieldData: documentEntry.fields[fieldDef.name]?.['en-US'],
            schemaDef,
            schemaOverrides,
            options,
          }),
        mapKey: (fieldDef) => T.succeed(fieldDef.name),
      }),
    )

    const raw = { sys: documentEntry.sys, metadata: documentEntry.metadata }
    const document: Core.Document = {
      ...docValues,
      [typeFieldName]: documentTypeDef.name,
      _id: documentEntry.sys.id,
      _raw: raw,
    }

    // Can't use e.g. `documentEntry.sys.updatedAt` here because it's not including changes to nested documents.
    const documentHash = yield* $(hashObject(document))

    return { document, documentHash }
  })

const makeNestedDocument = ({
  entryId,
  allEntries,
  allAssets,
  fieldDefs,
  typeName,
  schemaDef,
  schemaOverrides,
  options,
}: {
  entryId: string
  allEntries: Contentful.Entry[]
  allAssets: Contentful.Asset[]
  /** Passing `FieldDef[]` here instead of `ObjectDef` in order to also support `inline_embedded` */
  fieldDefs: Core.FieldDef[]
  typeName: string
  schemaDef: Core.SchemaDef
  schemaOverrides: SchemaOverrides.Normalized.SchemaOverrides
  options: Core.PluginOptions
}): T.Effect<OT.HasTracer, MakeDocumentError, Core.NestedDocument> =>
  T.gen(function* ($) {
    const { typeFieldName } = options.fieldOptions
    const objectEntry = allEntries.find((_) => _.sys.id === entryId)!
    const raw = { sys: objectEntry.sys, metadata: objectEntry.metadata }

    const objValues = yield* $(
      T.forEachParDict_(fieldDefs, {
        mapKey: (fieldDef) => T.succeed(fieldDef.name),
        mapValue: (fieldDef) =>
          getDataForFieldDef({
            fieldDef,
            allEntries,
            allAssets,
            rawFieldData: objectEntry.fields[fieldDef.name]?.['en-US'],
            schemaDef,
            schemaOverrides,
            options,
          }),
      }),
    )

    const obj: Core.NestedDocument = {
      ...objValues,
      [typeFieldName]: typeName,
      _raw: raw,
    }

    return obj
  })

const getDataForFieldDef = ({
  fieldDef,
  allEntries,
  allAssets,
  rawFieldData,
  schemaDef,
  schemaOverrides,
  options,
}: {
  fieldDef: Core.FieldDef
  rawFieldData: any
  allEntries: Contentful.Entry[]
  allAssets: Contentful.Asset[]
  schemaDef: Core.SchemaDef
  schemaOverrides: SchemaOverrides.Normalized.SchemaOverrides
  options: Core.PluginOptions
}): T.Effect<OT.HasTracer, MakeDocumentError, any> =>
  T.gen(function* ($) {
    if (rawFieldData === undefined) {
      if (fieldDef.isRequired) {
        console.error(`Inconsistent data found: ${fieldDef}`)
      }

      return undefined
    }

    switch (fieldDef.type) {
      case 'nested':
        const nestedTypeDef = schemaDef.nestedTypeDefMap[fieldDef.nestedTypeName]!
        return yield* $(
          makeNestedDocument({
            entryId: rawFieldData.sys.id,
            allEntries,
            allAssets,
            fieldDefs: nestedTypeDef.fieldDefs,
            typeName: fieldDef.nestedTypeName,
            schemaDef,
            schemaOverrides,
            options,
          }),
        )
      case 'nested_polymorphic':
      case 'nested_unnamed':
        throw new Error(`Doesn't exist in Contentful`)
      case 'reference':
        return rawFieldData.sys.id
      case 'reference_polymorphic':
        throw new Error(`Doesn't exist in Contentful`)
      case 'list_polymorphic':
      case 'list':
        return yield* $(
          T.forEachPar_(rawFieldData as any[], (rawItemData) =>
            getDataForListItem({
              rawItemData,
              allEntries,
              allAssets,
              fieldDef,
              schemaDef,
              schemaOverrides,
              options,
            }),
          ),
        )
      case 'date':
        return new Date(rawFieldData)
      case 'markdown':
        const html = yield* $(markdownToHtml({ mdString: rawFieldData, options: options?.markdown }))
        return <Core.Markdown>{ raw: rawFieldData, html }
      case 'mdx':
        const code = yield* $(bundleMDX({ mdxString: rawFieldData, options: options?.mdx }))
        return <Core.MDX>{ raw: rawFieldData, code }
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
  })

type ContentfulAssetEntry = { sys: { type: 'Link'; linkType: 'Asset'; id: string } }
const rawFieldDataIsAsset = (rawFieldData: any): rawFieldData is ContentfulAssetEntry =>
  rawFieldData.sys?.type === 'Link' && rawFieldData.sys?.linkType === 'Asset'

const getDataForListItem = ({
  rawItemData,
  allEntries,
  allAssets,
  fieldDef,
  schemaDef,
  schemaOverrides,
  options,
}: {
  rawItemData: any
  allEntries: Contentful.Entry[]
  allAssets: Contentful.Asset[]
  fieldDef: Core.ListFieldDef | Core.ListPolymorphicFieldDef
  schemaDef: Core.SchemaDef
  schemaOverrides: SchemaOverrides.Normalized.SchemaOverrides
  options: Core.PluginOptions
}): T.Effect<OT.HasTracer, MakeDocumentError, any> => {
  if (typeof rawItemData === 'string') {
    return T.succeed(rawItemData)
  }

  if (rawItemData.sys?.id) {
    // if (rawItemData.sys?.id && rawItemData.sys.id in schemaDef.objectDefMap) {
    const entry = allEntries.find((_) => _.sys.id === rawItemData.sys.id)!
    const typeName = schemaOverrides.nestedTypes[entry.sys.contentType.sys.id]!.defName
    const nestedTypeDef = schemaDef.nestedTypeDefMap[typeName]!
    return makeNestedDocument({
      entryId: rawItemData.sys.id,
      allEntries,
      allAssets,
      fieldDefs: nestedTypeDef.fieldDefs,
      typeName,
      schemaDef,
      schemaOverrides,
      options,
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
      options,
    })
  }

  throw new Error(`Case unhandled. Raw data: ${JSON.stringify(rawItemData, null, 2)}`)
}
