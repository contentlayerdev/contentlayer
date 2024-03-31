import * as core from '@contentlayer2/core'
import { SourceProvideSchemaError } from '@contentlayer2/core'
import * as utils from '@contentlayer2/utils'
import { casesHandled, partition } from '@contentlayer2/utils'
import { OT, pipe, T } from '@contentlayer2/utils/effect'

import { environmentGetContentTypes, getEnvironment } from './contentful.js'
import type * as SchemaOverrides from './schemaOverrides.js'
import { normalizeSchemaOverrides } from './schemaOverrides.js'
import type { Contentful } from './types.js'

export const provideSchema = ({
  accessToken,
  spaceId,
  environmentId,
  schemaOverrides: schemaOverrides_,
  options,
}: {
  accessToken: string
  spaceId: string
  environmentId: string
  schemaOverrides: SchemaOverrides.Input.SchemaOverrides
  options: core.PluginOptions
}): T.Effect<OT.HasTracer, SourceProvideSchemaError, core.SchemaDef> =>
  pipe(
    T.gen(function* ($) {
      const environment = yield* $(getEnvironment({ accessToken, spaceId, environmentId }))
      const contentTypes = yield* $(environmentGetContentTypes(environment))

      const schemaOverrides = normalizeSchemaOverrides({
        contentTypes,
        schemaOverrides: schemaOverrides_,
      })

      // ;(await import('fs')).writeFileSync('.tmp.contentTypes.json', JSON.stringify(contentTypes, null, 2))

      const [documentContentTypes, objectContentTypes] = partition(contentTypes, (_): _ is Contentful.ContentType =>
        isDocument({ schemaOverrides, contentTypeId: _.sys.id }),
      )

      const documentTypeDefs = documentContentTypes.map((contentType) =>
        toDocumentTypeDef({ contentType, schemaOverrides }),
      )
      const documentTypeDefMap = documentTypeDefs.reduce(
        (acc, documentDef) => ({ ...acc, [documentDef.name]: documentDef }),
        {},
      )
      const nestedTypeDefs = objectContentTypes.map((contentType) => toNestedTypeDef({ contentType, schemaOverrides }))
      const nestedTypeDefMap = nestedTypeDefs.reduce(
        (acc, documentDef) => ({ ...acc, [documentDef.name]: documentDef }),
        {},
      )

      const defs = { documentTypeDefMap, nestedTypeDefMap }
      const hash = yield* $(utils.hashObject({ defs, options }))

      // if (process.env['CL_DEBUG']) {
      //   ;(await import('fs')).writeFileSync('.tmp.schema.json', JSON.stringify(defs, null, 2))
      // }

      const coreSchemaDef: core.SchemaDef = { ...defs, hash }

      core.validateSchema(coreSchemaDef)

      return coreSchemaDef
    }),
    OT.withSpan('@contentlayer2/source-contentlayer/fetchData:provideSchema', {
      attributes: { spaceId, environmentId },
    }),
    T.mapError((error) => new SourceProvideSchemaError({ error })),
  )

const isDocument = ({
  contentTypeId,
  schemaOverrides,
}: {
  contentTypeId: string
  schemaOverrides: SchemaOverrides.Normalized.SchemaOverrides
}): boolean => schemaOverrides.documentTypes[contentTypeId] !== undefined

const toDocumentTypeDef = ({
  contentType,
  schemaOverrides,
}: {
  contentType: Contentful.ContentType
  schemaOverrides: SchemaOverrides.Normalized.SchemaOverrides
}): core.DocumentTypeDef => {
  return {
    _tag: 'DocumentTypeDef',
    name: schemaOverrides.documentTypes[contentType.sys.id]!.defName,
    // label: contentType.name,
    fieldDefs: contentType.fields.map((field: any) =>
      toFieldDef({
        field,
        schemaOverrides,
        fieldOverrides: schemaOverrides.documentTypes[contentType.sys.id]!.fields[field.id],
      }),
    ),
    computedFields: [],
    description: contentType.description,
    // labelField: contentType.displayField,
    isSingleton: schemaOverrides.documentTypes[contentType.sys.id]!.isSingleton,
    extensions: {},
  }
}

const toNestedTypeDef = ({
  contentType,
  schemaOverrides,
}: {
  contentType: Contentful.ContentType
  schemaOverrides: SchemaOverrides.Normalized.SchemaOverrides
}): core.NestedTypeDef => {
  return {
    _tag: 'NestedTypeDef',
    name: schemaOverrides.nestedTypes[contentType.sys.id]!.defName,
    // label: contentType.name,
    fieldDefs: contentType.fields.map((field: any) =>
      toFieldDef({
        field,
        schemaOverrides,
        fieldOverrides: schemaOverrides.nestedTypes[contentType.sys.id]!.fields[field.id],
      }),
    ),
    description: contentType.description,
    // labelField: contentType.displayField,
    extensions: {},
  }
}

const toFieldDef = ({
  field,
  schemaOverrides,
  fieldOverrides,
}: {
  field: Contentful.ContentFields & Contentful.FieldType
  schemaOverrides: SchemaOverrides.Normalized.SchemaOverrides
  fieldOverrides: SchemaOverrides.Normalized.FieldOverrideItem | undefined
}): core.FieldDef => {
  const fieldBase: core.FieldDefBase & { default?: any } = {
    name: fieldOverrides?.name ?? field.id,
    // label: field.name,
    // hidden: field.omitted,
    isRequired: field.required,
    // const: undefined,
    default: undefined,
    description: undefined,
    isSystemField: false,
  }

  if (fieldOverrides?.type) {
    return { ...fieldBase, type: 'markdown' }
  }

  switch (field.type) {
    case 'Boolean':
      return { ...fieldBase, type: 'boolean' }
    case 'Number':
    case 'Integer':
      return { ...fieldBase, type: 'number' }
    case 'Date':
      return { ...fieldBase, type: 'date' }
    case 'Symbol':
    case 'Text':
      return { ...fieldBase, type: 'string' }
    case 'RichText':
      return { ...fieldBase, type: 'markdown' }
    case 'Link':
      switch (field.linkType) {
        case 'Entry':
          const contentTypeId = field.validations![0]!.linkContentType![0]!
          if (isDocument({ schemaOverrides, contentTypeId })) {
            const documentTypeName = schemaOverrides.documentTypes[contentTypeId]!.defName
            return { ...fieldBase, type: 'reference', documentTypeName, embedDocument: false }
          } else {
            const nestedTypeName = schemaOverrides.nestedTypes[contentTypeId]!.defName
            return { ...fieldBase, type: 'nested', nestedTypeName }
          }
        case 'Asset':
          // e.g. for images
          return { ...fieldBase, type: 'string' }
        default:
          casesHandled(field)
      }
    case 'Location':
    case 'Object':
      return { ...fieldBase, type: 'json' }
    case 'Array':
      if (field.items.type === 'Link') {
        if (field.items.validations![0]!.linkContentType!.length === 1) {
          return {
            ...fieldBase,
            type: 'list',
            of: toListFieldDefItem({
              contentTypeId: field.items.validations![0]!.linkContentType![0]!,
              schemaOverrides,
            }),
          }
        } else {
          return {
            ...fieldBase,
            type: 'list_polymorphic',
            of: field.items.validations![0]!.linkContentType!.map((contentTypeId) =>
              toListFieldDefItem({ contentTypeId, schemaOverrides }),
            ),
            // TODO support dot syntax or array syntax
            typeField: 'contentType.sys.id',
          }
        }
      } else {
        if (field.items.validations && field.items.validations.length > 0 && field.items.validations[0]!.in) {
          return {
            ...fieldBase,
            type: 'enum',
            options: field.items.validations![0]!.in,
          }
        } else {
          return {
            ...fieldBase,
            type: 'list',
            of: { type: 'string' },
          }
        }
      }
    default:
      casesHandled(field)
  }
}

const toListFieldDefItem = ({
  contentTypeId,
  schemaOverrides,
}: {
  contentTypeId: string
  schemaOverrides: SchemaOverrides.Normalized.SchemaOverrides
}): core.ListFieldDefItem.Item => {
  if (isDocument({ schemaOverrides, contentTypeId: contentTypeId })) {
    const documentTypeName = schemaOverrides.documentTypes[contentTypeId]!.defName
    return { type: 'reference', documentTypeName, embedDocument: false }
  } else {
    const nestedTypeName = schemaOverrides.nestedTypes[contentTypeId]!.defName
    return { type: 'nested', nestedTypeName }
  }
}
