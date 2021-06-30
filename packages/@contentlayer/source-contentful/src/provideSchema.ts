import type * as Core from '@contentlayer/core'
import { casesHandled, partition } from '@contentlayer/utils'

import type * as SchemaOverrides from './schemaOverrides'
import { normalizeSchemaOverrides } from './schemaOverrides'
import type { Contentful } from './types'

export const provideSchema = async ({
  environment,
  schemaOverrides: schemaOverrides_,
}: {
  environment: Contentful.Environment
  schemaOverrides: SchemaOverrides.Input.SchemaOverrides
}): Promise<Core.SchemaDef> => {
  const contentTypes = await environment.getContentTypes()

  const schemaOverrides = normalizeSchemaOverrides({
    contentTypes: contentTypes.items,
    schemaOverrides: schemaOverrides_,
  })

  // ;(await import('fs')).writeFileSync('.tmp.contentTypes.json', JSON.stringify(contentTypes, null, 2))

  const [documentContentTypes, objectContentTypes] = partition(contentTypes.items, (_) =>
    isDocument({ schemaOverrides, contentTypeId: _.sys.id }),
  )

  const documentDefs = documentContentTypes.map((contentType) => toDocumentDef({ contentType, schemaOverrides }))
  const documentDefMap = documentDefs.reduce((acc, documentDef) => ({ ...acc, [documentDef.name]: documentDef }), {})
  const objectDefs = objectContentTypes.map((contentType) => toObjectDef({ contentType, schemaOverrides }))
  const objectDefMap = objectDefs.reduce((acc, documentDef) => ({ ...acc, [documentDef.name]: documentDef }), {})

  const schema = { documentDefMap, objectDefMap }

  if (process.env['CL_DEBUG']) {
    ;(await import('fs')).writeFileSync('.tmp.schema.json', JSON.stringify(schema, null, 2))
  }
  return schema
}

const isDocument = ({
  contentTypeId,
  schemaOverrides,
}: {
  contentTypeId: string
  schemaOverrides: SchemaOverrides.Normalized.SchemaOverrides
}): boolean => schemaOverrides.documentTypes[contentTypeId] !== undefined

const toDocumentDef = ({
  contentType,
  schemaOverrides,
}: {
  contentType: Contentful.ContentType
  schemaOverrides: SchemaOverrides.Normalized.SchemaOverrides
}): Core.DocumentDef => {
  return {
    _tag: 'DocumentDef',
    name: schemaOverrides.documentTypes[contentType.sys.id].defName,
    label: contentType.name,
    fieldDefs: contentType.fields.map((field: any) =>
      toFieldDef({
        field,
        schemaOverrides,
        fieldOverrides: schemaOverrides.documentTypes[contentType.sys.id].fields[field.id],
      }),
    ),
    computedFields: [],
    description: contentType.description,
    labelField: contentType.displayField,
    isSingleton: schemaOverrides.documentTypes[contentType.sys.id].isSingleton,
  }
}

const toObjectDef = ({
  contentType,
  schemaOverrides,
}: {
  contentType: Contentful.ContentType
  schemaOverrides: SchemaOverrides.Normalized.SchemaOverrides
}): Core.ObjectDef => {
  return {
    _tag: 'ObjectDef',
    name: schemaOverrides.objectTypes[contentType.sys.id].defName,
    label: contentType.name,
    fieldDefs: contentType.fields.map((field: any) =>
      toFieldDef({
        field,
        schemaOverrides,
        fieldOverrides: schemaOverrides.objectTypes[contentType.sys.id].fields[field.id],
      }),
    ),
    description: contentType.description,
    labelField: contentType.displayField,
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
}): Core.FieldDef => {
  const fieldBase: Core.FieldBase & { default?: any } = {
    name: fieldOverrides?.name ?? field.id,
    label: field.name,
    hidden: field.omitted,
    required: field.required,
    const: undefined,
    default: undefined,
    description: undefined,
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
      if (field.linkType === 'Entry') {
        const typeName = field.validations![0].linkContentType![0]
        if (isDocument({ schemaOverrides, contentTypeId: typeName })) {
          return { ...fieldBase, type: 'reference', documentName: typeName }
        } else {
          return { ...fieldBase, type: 'object', objectName: typeName }
        }
      } else {
        return { ...fieldBase, type: 'image' }
      }
    case 'Location':
    case 'Object':
      return { ...fieldBase, type: 'json' }
    case 'Array':
      if (field.items.type === 'Link') {
        if (field.items.validations![0].linkContentType!.length === 1) {
          return {
            ...fieldBase,
            type: 'list',
            of: toListFieldDefItem({ typeName: field.items.validations![0].linkContentType![0], schemaOverrides }),
          }
        } else {
          return {
            ...fieldBase,
            type: 'polymorphic_list',
            of: field.items.validations![0].linkContentType!.map((typeName) =>
              toListFieldDefItem({ typeName, schemaOverrides }),
            ),
            // TODO support dot syntax or array syntax
            typeField: 'contentType.sys.id',
          }
        }
      } else {
        if (field.items.validations && field.items.validations.length > 0 && field.items.validations[0].in) {
          return {
            ...fieldBase,
            type: 'enum',
            options: field.items.validations![0].in,
          }
        } else {
          return {
            ...fieldBase,
            type: 'list',
            of: { type: 'string', labelField: undefined },
          }
        }
      }
    default:
      casesHandled(field)
  }
}

const toListFieldDefItem = ({
  typeName,
  schemaOverrides,
}: {
  typeName: string
  schemaOverrides: SchemaOverrides.Normalized.SchemaOverrides
}): Core.ListFieldDefItem => {
  if (isDocument({ schemaOverrides, contentTypeId: typeName })) {
    return { type: 'reference', documentName: typeName, labelField: undefined }
  } else {
    return { type: 'object', objectName: typeName, labelField: undefined }
  }
}
