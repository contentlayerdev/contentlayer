import * as Core from '@contentlayer/core'
import { hashObject } from '@contentlayer/core'
import { casesHandled, pick, traceFn, uppercaseFirstChar } from '@contentlayer/utils'

import type { DocumentTypeDef, FieldDef, FieldDefs, ListFieldItem, NestedTypeDef, SchemaDef } from './schema'
import { isNestedTypeDef } from './schema'
import { isPolymorphicListField, isUnnamedNestedTypeDef } from './schema'

export const makeCoreSchema = ((schemaDef: SchemaDef): Core.SchemaDef => {
  const coreDocumentTypeDefMap: Core.DocumentTypeDefMap = {}
  const coreNestedTypeDefMap: Core.NestedTypeDefMap = {}

  for (const documentDef of schemaDef.documentDefs) {
    validateDefName({ defName: documentDef.name })

    const fieldDefs = getFieldDefEntries(documentDef.fields).map(fieldDefEntryToCoreFieldDef)

    // add default content markdown field if not explicitly provided
    if (
      (documentDef.fileType === undefined || documentDef.fileType === 'markdown') &&
      fieldDefs.every((_) => _.name !== 'content')
    ) {
      fieldDefs.push({
        type: 'markdown',
        name: 'content',
        description: 'Markdown file content',
        default: undefined,
        required: undefined,
      })
    }

    // add default content MDX field if not explicitly provided
    if (documentDef.fileType === 'mdx' && fieldDefs.every((_) => _.name !== 'content')) {
      fieldDefs.push({
        type: 'mdx',
        name: 'content',
        description: 'MDX file content',
        default: undefined,
        required: undefined,
      })
    }

    const computedFields = Object.entries(documentDef.computedFields ?? {}).map<Core.ComputedField>(
      ([name, computedField]) => ({ ...pick(computedField, ['description', 'resolve', 'type']), name }),
    )

    const coreDocumentDef: Core.DocumentTypeDef = {
      _tag: 'DocumentTypeDef',
      ...pick(documentDef, ['name', 'description']),
      isSingleton: documentDef.isSingleton ?? false,
      fieldDefs,
      computedFields,
      extensions: documentDef.extensions ?? {},
    }
    coreDocumentTypeDefMap[documentDef.name] = coreDocumentDef
  }

  const nestedDefs = collectNestedDefs(schemaDef.documentDefs)
  for (const nestedDef of nestedDefs) {
    validateDefName({ defName: nestedDef.name })

    const coreNestedTypeDef: Core.NestedTypeDef = {
      _tag: 'NestedTypeDef',
      ...pick(nestedDef, ['description']),
      name: nestedDef.name,
      fieldDefs: getFieldDefEntries(nestedDef.fields).map(fieldDefEntryToCoreFieldDef),
      extensions: nestedDef.extensions ?? {},
    }
    coreNestedTypeDefMap[coreNestedTypeDef.name] = coreNestedTypeDef
  }

  const defs = { documentTypeDefMap: coreDocumentTypeDefMap, nestedTypeDefMap: coreNestedTypeDefMap }
  const hash = hashObject(defs)

  const coreSchemaDef = { ...defs, hash }

  Core.validateSchema(coreSchemaDef)

  return coreSchemaDef
})['|>'](traceFn('@contentlayer/source-local:makeCoreSchema', ['documentDefs']))

const validateDefName = ({ defName }: { defName: string }): void => {
  const firstChar = defName.charAt(0)
  if (firstChar.toLowerCase() === firstChar) {
    const improvedDefName = uppercaseFirstChar(defName)
    console.warn(`\
Warning: A document or nested definition name should start with a uppercase letter.
You've provided the name "${defName}" - please consider using "${improvedDefName}" instead.
`)
  }
}

const getFieldDefEntries = (fieldDefs: FieldDefs): FieldDefEntry[] => {
  if (Array.isArray(fieldDefs)) {
    return fieldDefs.map((fieldDef) => [fieldDef.name, fieldDef])
  } else {
    return Object.entries(fieldDefs)
  }
}

const getFieldDefValues = (fieldDefs: FieldDefs): FieldDef[] => {
  if (Array.isArray(fieldDefs)) {
    return fieldDefs
  } else {
    return Object.values(fieldDefs)
  }
}

type FieldDefEntry = [fieldName: string, fieldDef: FieldDef]

const fieldDefEntryToCoreFieldDef = ([name, fieldDef]: FieldDefEntry): Core.FieldDef => {
  const baseFields: Core.FieldBase = {
    ...pick(fieldDef, ['type', 'default', 'description', 'required']),
    name,
  }
  switch (fieldDef.type) {
    case 'list':
      if (isPolymorphicListField(fieldDef)) {
        return <Core.PolymorphicListFieldDef>{
          ...baseFields,
          type: 'polymorphic_list',
          typeField: fieldDef.typeField,
          of: fieldDef.of.map(fieldListItemsToCoreFieldListDefItems),
        }
      }

      return <Core.ListFieldDef>{ ...baseFields, of: fieldListItemsToCoreFieldListDefItems(fieldDef.of) }
    case 'nested':
      const nestedTypeDef = fieldDef.def()
      if (isNestedTypeDef(nestedTypeDef)) {
        return <Core.NestedFieldDef>{ ...baseFields, nestedTypeName: nestedTypeDef.name }
      }

      const fieldDefs = getFieldDefEntries(nestedTypeDef.fields).map(fieldDefEntryToCoreFieldDef)
      const extensions = nestedTypeDef.extensions ?? {}
      const typeDef: Core.UnnamedNestedTypeDef = { _tag: 'UnnamedNestedTypeDef', fieldDefs, extensions }
      return <Core.UnnamedNestedFieldDef>{ ...baseFields, type: 'unnamed_nested', typeDef }
    case 'document':
      return <Core.ReferenceFieldDef>{ ...baseFields, documentTypeName: fieldDef.def().name }
    case 'enum':
      return <Core.EnumFieldDef>{ ...baseFields, options: fieldDef.options }
    case 'boolean':
    case 'date':
    case 'image':
    case 'json':
    case 'markdown':
    case 'mdx':
    case 'number':
    case 'slug':
    case 'string':
    case 'text':
    case 'url':
      return {
        // needs to pick again since fieldDef.type has been
        ...pick(fieldDef, ['type', 'default', 'description', 'required']),
        name,
      }
    default:
      casesHandled(fieldDef)
  }
}

const fieldListItemsToCoreFieldListDefItems = (listFieldItem: ListFieldItem): Core.ListFieldDefItem.Item => {
  switch (listFieldItem.type) {
    case 'boolean':
    case 'string':
      return pick(listFieldItem, ['type'])
    case 'enum':
      return {
        type: 'enum',
        options: listFieldItem.options,
      }
    case 'nested':
      const nestedTypeDef = listFieldItem.def()
      if (isNestedTypeDef(nestedTypeDef)) {
        return { type: 'nested', nestedTypeName: nestedTypeDef.name }
      }

      const fieldDefs = getFieldDefEntries(nestedTypeDef.fields).map(fieldDefEntryToCoreFieldDef)
      const extensions = nestedTypeDef.extensions ?? {}
      const typeDef: Core.UnnamedNestedTypeDef = { _tag: 'UnnamedNestedTypeDef', fieldDefs, extensions }
      return { type: 'unnamed_nested', typeDef }
    case 'document':
      return {
        type: 'document',
        documentName: listFieldItem.def().name,
      }
    default:
      casesHandled(listFieldItem)
  }
}

const collectNestedDefs = (documentDefs: DocumentTypeDef[]): NestedTypeDef[] => {
  const objectDefMap: { [objectDefName: string]: NestedTypeDef } = {}

  const traverseNestedDef = (objectDef: NestedTypeDef) => {
    if (objectDef.name in objectDefMap) {
      return
    }

    objectDefMap[objectDef.name] = objectDef

    getFieldDefValues(objectDef.fields).forEach(traverseField)
  }

  const traverseField = (field: FieldDef) => {
    switch (field.type) {
      case 'nested':
        const nestedTypeDef = field.def()
        if (isNestedTypeDef(nestedTypeDef)) {
          return traverseNestedDef(nestedTypeDef)
        }
        return getFieldDefValues(nestedTypeDef.fields).forEach(traverseField)
      case 'list':
        if (isPolymorphicListField(field)) {
          return field.of.forEach(traverseListFieldItem)
        }
        return traverseListFieldItem(field.of)
      case 'boolean':
      case 'date':
      case 'enum':
      case 'image':
      case 'json':
      case 'markdown':
      case 'mdx':
      case 'number':
      case 'slug':
      case 'string':
      case 'text':
      case 'url':
      case 'document':
        return
      default:
        casesHandled(field)
    }
  }

  const traverseListFieldItem = (listFieldItem: ListFieldItem) => {
    switch (listFieldItem.type) {
      case 'nested':
        const nestedTypeDef = listFieldItem.def()
        if (isUnnamedNestedTypeDef(nestedTypeDef)) {
          return getFieldDefValues(nestedTypeDef.fields).forEach(traverseField)
        }
        return traverseNestedDef(nestedTypeDef)
    }
  }

  documentDefs.flatMap((_) => getFieldDefValues(_.fields)).forEach(traverseField)

  return Object.values(objectDefMap)
}
