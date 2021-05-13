import type * as Core from '@contentlayer/core'
import { assertUnreachable, partition } from '@contentlayer/utils'
import { SchemaOverrides } from '.'
import type * as Contentful from './contentful-types'

export const provideSchema = async ({
  environment,
  schemaOverrides,
}: {
  environment: Contentful.Environment
  schemaOverrides: SchemaOverrides
}): Promise<Core.SchemaDef> => {
  const contentTypes = await environment.getContentTypes()

  // ;(await import('fs')).writeFileSync('.tmp.contentTypes.json', JSON.stringify(contentTypes, null, 2))

  const [documentContentTypes, objectContentTypes] = partition(contentTypes.items, (_) =>
    isDocument({ schemaOverrides, typeName: _.sys.id }),
  )

  const documentDefs = documentContentTypes.map((contentType) => toDocumentDef({ contentType, schemaOverrides }))
  const documentDefMap = documentDefs.reduce((acc, documentDef) => ({ ...acc, [documentDef.name]: documentDef }), {})
  const objectDefs = objectContentTypes.map((contentType) => toObjectDef({ contentType, schemaOverrides }))
  const objectDefMap = objectDefs.reduce((acc, documentDef) => ({ ...acc, [documentDef.name]: documentDef }), {})
  return { documentDefMap, objectDefMap }
}

const isDocument = ({ typeName, schemaOverrides }: { typeName: string; schemaOverrides: SchemaOverrides }): boolean => {
  if (schemaOverrides.documentTypes && schemaOverrides.objectTypes) {
    throw new Error(`Please only specify either documentTypes or objectTypes in the schemaOverrides`)
  } else if (!schemaOverrides.documentTypes && !schemaOverrides.objectTypes) {
    return true
  } else if (schemaOverrides.documentTypes) {
    return schemaOverrides.documentTypes.includes(typeName)
  } else {
    return !schemaOverrides.objectTypes!.includes(typeName)
  }
}

const toDocumentDef = ({
  contentType,
  schemaOverrides,
}: {
  contentType: Contentful.ContentType
  schemaOverrides: SchemaOverrides
}): Core.DocumentDef => {
  return {
    name: contentType.sys.id,
    label: contentType.name,
    fieldDefs: contentType.fields.map((field: any) => toFieldDef({ field, schemaOverrides })),
    computedFields: [],
    description: contentType.description,
    labelField: contentType.displayField,
    isSingleton: false,
  }
}

const toObjectDef = ({
  contentType,
  schemaOverrides,
}: {
  contentType: Contentful.ContentType
  schemaOverrides: SchemaOverrides
}): Core.ObjectDef => {
  return {
    name: contentType.sys.id,
    label: contentType.name,
    fieldDefs: contentType.fields.map((field: any) => toFieldDef({ field, schemaOverrides })),
    description: contentType.description,
    labelField: contentType.displayField,
  }
}

const toFieldDef = ({
  field,
  schemaOverrides,
}: {
  field: Contentful.ContentFields & Contentful.FieldType
  schemaOverrides: SchemaOverrides
}): Core.FieldDef => {
  const fieldBase: Core.FieldBase & { default?: any } = {
    name: field.id,
    label: field.name,
    hidden: field.omitted,
    required: field.required,
    const: undefined,
    default: undefined,
    description: undefined,
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
        if (isDocument({ schemaOverrides, typeName })) {
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
      assertUnreachable(field)
  }
}

const toListFieldDefItem = ({
  typeName,
  schemaOverrides,
}: {
  typeName: string
  schemaOverrides: SchemaOverrides
}): Core.ListFieldDefItem => {
  if (isDocument({ schemaOverrides, typeName })) {
    return { type: 'reference', documentName: typeName, labelField: undefined }
  } else {
    return { type: 'object', objectName: typeName, labelField: undefined }
  }
}
