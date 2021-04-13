const getSanitySchema = require('@sanity/core/lib/actions/graphql/getSanitySchema')
import type * as Core from '@contentlayer/core'
import { pick } from '@contentlayer/core'
import Schema from '@sanity/schema'
import type * as Sanity from './sanity-types'

export const provideSchema = async (studioDirPath: string): Promise<Core.SchemaDef> => {
  const schema: Schema = getSanitySchema(studioDirPath)
  const types = schema._original.types

  // ;(await import('fs')).writeFileSync('schema.json', JSON.stringify(types, null, 2))

  const documentTypes = types
    .filter((_): _ is Sanity.DocumentType => _.type === 'document')
    .filter((_) => !_.name.startsWith('sanity.'))
  const objectTypes = types.filter((_): _ is Sanity.ObjectType => _.type === 'object')

  const objectTypeNames = objectTypes.map((_) => _.name)

  const documentDefMap: Core.DocumentDefMap = documentTypes
    .map(sanityDocumentTypeToCoreDocumentDef(objectTypeNames))
    .map(sanitizeDef)
    .reduce((acc, _) => ({ ...acc, [_.name]: _ }), {})

  const usedObjectTypes = collectUsedObjectTypes({ documentTypes, objectTypes })
  const objectDefMap: Core.ObjectDefMap = usedObjectTypes
    .map(sanityObjectTypeToCoreObjectDef(objectTypeNames))
    .map(sanitizeDef)
    .reduce((acc, _) => ({ ...acc, [_.name]: _ }), {})

  return { documentDefMap, objectDefMap }
}

/**
 * Looks for object types that were referenced (directly or indirectly) through at least one document type.
 */
const collectUsedObjectTypes = ({
  documentTypes,
  objectTypes,
}: {
  documentTypes: Sanity.DocumentType[]
  objectTypes: Sanity.ObjectType[]
}): Sanity.ObjectType[] => {
  const objectTypeMap: { [typeName: string]: Sanity.ObjectType } = objectTypes.reduce(
    (acc, _) => ({ ...acc, [_.name]: _ }),
    {},
  )
  const visitedObjectTypes: { [typeName: string]: boolean } = {}
  const traverseObjectType = (objectType: Sanity.ObjectType) => {
    if (objectType.name in visitedObjectTypes) {
      return
    }

    visitedObjectTypes[objectType.name] = true

    objectType.fields.forEach(traverseField)
  }

  const traverseField = (field: Sanity.Field) => {
    switch (field.type) {
      case 'object':
        return field.fields.forEach(traverseField)
      case 'array':
        return field.of.map(traverseArrayOf)
      default:
        if (field.type in objectTypeMap) {
          traverseObjectType(objectTypeMap[field.type])
        }
    }
  }

  const traverseArrayOf = (arrayOf: Sanity.ArrayOf) => {
    switch (arrayOf.type) {
      case 'object':
        return arrayOf.fields.forEach(traverseField)
      default:
        if (arrayOf.type in objectTypeMap) {
          traverseObjectType(objectTypeMap[arrayOf.type])
        }
    }
  }

  documentTypes.flatMap((_) => _.fields).forEach(traverseField)

  return Object.keys(visitedObjectTypes).map((_) => objectTypeMap[_])
}

const sanityDocumentTypeToCoreDocumentDef = (objectTypeNames: string[]) => (
  documentType: Sanity.DocumentType,
): Core.DocumentDef => {
  const previewSelectValues = Object.values(documentType.preview?.select ?? {})
  return {
    name: documentType.name,
    label: documentType.title ?? '',
    labelField: previewSelectValues.length > 0 ? previewSelectValues[0] : undefined,
    fieldDefs: documentType.fields.map(sanityFieldToCoreFieldDef(objectTypeNames)),
    computedFields: [],
  }
}

const sanityObjectTypeToCoreObjectDef = (objectTypeNames: string[]) => (
  objectType: Sanity.ObjectType,
): Core.ObjectDef => {
  return {
    name: objectType.name,
    label: objectType.title ?? '',
    description: objectType.description,
    fieldDefs: objectType.fields.map(sanityFieldToCoreFieldDef(objectTypeNames)),
  }
}

const sanityMockRule = new Proxy<Sanity.RuleType>({} as any, {
  get: (_target, prop) => {
    if (prop === 'required') {
      return () => true
    } else {
      return () => false
    }
  },
})

const sanityFieldToCoreFieldDef = (objectTypeNames: string[]) => (field: Sanity.Field): Core.FieldDef => {
  const required = field.validation?.(sanityMockRule) as boolean | undefined
  const baseFields = { ...pick(field, ['description', 'name']), required }
  switch (field.type) {
    case 'reference':
      return <Core.ReferenceFieldDef>{
        ...baseFields,
        type: 'reference',
        // TODO support polymorphic references
        documentName: field.to[0].type,
      }
    case 'array':
      // special handling for enum array
      if ((field.options as any)?.list) {
        return <Core.ListFieldDef>{
          ...baseFields,
          type: 'list',
          of: <Core.ListFieldItemEnum>{ type: 'enum', options: (field.options as any).list },
        }
      }

      if (field.of.length === 1) {
        return <Core.ListFieldDef>{
          ...baseFields,
          type: 'list',
          of: sanityArrayOfToCoreFieldListDefItem(objectTypeNames)(field.of[0]),
        }
      }

      return <Core.PolymorphicListFieldDef>{
        ...baseFields,
        type: 'polymorphic_list',
        of: field.of.map(sanityArrayOfToCoreFieldListDefItem(objectTypeNames)),
        typeField: '_type',
      }
    case 'object':
      return <Core.InlineObjectFieldDef>{
        ...baseFields,
        type: 'inline_object',
        fieldDefs: field.fields.map(sanityFieldToCoreFieldDef(objectTypeNames)),
      }
    case 'date':
    case 'datetime': {
      return <Core.DateFieldDef>{
        ...baseFields,
        type: 'date',
        label: field.title,
        hidden: field.hidden,
      }
    }
    case 'string': {
      // special handling for enum
      if (field.options?.list) {
        return <Core.EnumFieldDef>{
          ...baseFields,
          type: 'enum',
          options: field.options.list,
          label: field.title,
          hidden: field.hidden,
        }
      }
    }
    case 'markdown':
    case 'url':
    case 'image':
    case 'slug':
    case 'boolean':
    case 'number':
    case 'text': {
      type FieldDef =
        | Core.MarkdownFieldDef
        | Core.UrlFieldDef
        | Core.ImageFieldDef
        | Core.SlugFieldDef
        | Core.BooleanFieldDef
        | Core.NumberFieldDef
        | Core.StringFieldDef
        | Core.TextFieldDef
      return <FieldDef>{
        ...baseFields,
        type: field.type,
        label: field.title,
        hidden: field.hidden,
      }
    }
    case 'block':
    default: {
      if (objectTypeNames.includes(field.type)) {
        return <Core.ObjectFieldDef>{
          ...baseFields,
          type: 'object',
          objectName: field.type,
        }
      }

      throw new Error(`Case not implemented ${field.type}`)
    }
  }
}

const sanityArrayOfToCoreFieldListDefItem = (objectTypeNames: string[]) => (
  arrayOf: Sanity.ArrayOf,
): Core.ListFieldDefItem => {
  switch (arrayOf.type) {
    case 'string':
      return <Core.ListFieldItemString>{ type: 'string' }
    case 'reference':
      return <Core.ListFieldItemReference>{
        type: 'reference',
        // TODO support polymorphic references
        documentName: arrayOf.to[0].type,
      }
    case 'object':
      return <Core.ListFieldItemInlineObject>{
        type: 'inline_object',
        fieldDefs: arrayOf.fields.map(sanityFieldToCoreFieldDef(objectTypeNames)),
      }
    default:
      if (objectTypeNames.includes(arrayOf.type)) {
        return <Core.ListFieldItemObject>{ type: 'object', objectName: arrayOf.type }
      }

      throw new Error(`Case not implemented ${arrayOf.type}`)
  }
}

const sanitizeString = (_: string): string => _.replace(/\./g, '_')

/** Sanitizes the schema definition (e.g. replace "." with "_" in type names) */
const sanitizeDef = <Def extends Core.ObjectDef | Core.DocumentDef>(def: Def): Def => {
  def.name = sanitizeString(def.name)
  def.fieldDefs.forEach((fieldDef) => {
    fieldDef.name = sanitizeString(fieldDef.name)
    switch (fieldDef.type) {
      case 'object':
        fieldDef.objectName = sanitizeString(fieldDef.objectName)
        break
      case 'reference':
        fieldDef.documentName = sanitizeString(fieldDef.documentName)
        break
      case 'polymorphic_list':
        fieldDef.of.forEach(sanitizeListItemDef)
        break
      case 'list':
        sanitizeListItemDef(fieldDef.of)
        break
    }
  })

  return def
}

const sanitizeListItemDef = (item: Core.ListFieldDefItem): void => {
  switch (item.type) {
    case 'object':
      item.objectName = sanitizeString(item.objectName)
      break
    case 'reference':
      item.documentName = sanitizeString(item.documentName)
      break
  }
}
