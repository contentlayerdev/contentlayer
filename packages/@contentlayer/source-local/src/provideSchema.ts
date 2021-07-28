import * as Core from '@contentlayer/core'
import { hashObject } from '@contentlayer/core'
import { casesHandled, pick, traceFn, uppercaseFirstChar } from '@contentlayer/utils'

import type { DocumentDef, FieldDef, FieldDefs, ListFieldItem, ObjectDef, SchemaDef } from './schema'

export const makeCoreSchema = ((schemaDef: SchemaDef): Core.SchemaDef => {
  const coreDocumentDefMap: Core.DocumentDefMap = {}
  const coreObjectDefMap: Core.ObjectDefMap = {}

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

    const coreDocumentDef: Core.DocumentDef = {
      _tag: 'DocumentDef',
      ...pick(documentDef, ['name', 'description']),
      isSingleton: documentDef.isSingleton ?? false,
      fieldDefs,
      computedFields,
      extensions: documentDef.extensions ?? {},
    }
    coreDocumentDefMap[documentDef.name] = coreDocumentDef
  }

  const objectDefs = collectObjectDefs(schemaDef.documentDefs)
  for (const objectDef of objectDefs) {
    validateDefName({ defName: objectDef.name })

    const coreObjectDef: Core.ObjectDef = {
      _tag: 'ObjectDef',
      ...pick(objectDef, ['name', 'description']),
      fieldDefs: getFieldDefEntries(objectDef.fields).map(fieldDefEntryToCoreFieldDef),
      extensions: objectDef.extensions ?? {},
    }
    coreObjectDefMap[coreObjectDef.name] = coreObjectDef
  }

  const defs = { documentDefMap: coreDocumentDefMap, objectDefMap: coreObjectDefMap }
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
Warning: A document or object definition name should start with a uppercase letter.
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
      return <Core.ListFieldDef>{ ...baseFields, of: fieldListItemsToCoreFieldListDefItems(fieldDef.of) }
    case 'polymorphic_list':
      return <Core.PolymorphicListFieldDef>{
        ...baseFields,
        typeField: fieldDef.typeField,
        of: fieldDef.of.map(fieldListItemsToCoreFieldListDefItems),
      }
    case 'object':
      return <Core.ObjectFieldDef>{ ...baseFields, objectName: fieldDef.def().name }
    case 'inline_object':
      const fieldDefs = getFieldDefEntries(fieldDef.fields).map(fieldDefEntryToCoreFieldDef)
      return <Core.InlineObjectFieldDef>{ ...baseFields, fieldDefs }
    case 'document':
      return <Core.ReferenceFieldDef>{ ...baseFields, documentName: fieldDef.def().name }
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

const fieldListItemsToCoreFieldListDefItems = (listFieldItem: ListFieldItem): Core.ListFieldDefItem => {
  switch (listFieldItem.type) {
    case 'boolean':
    case 'string':
      return pick(listFieldItem, ['type'])
    case 'enum':
      return {
        type: 'enum',
        options: listFieldItem.options,
      }
    case 'object':
      return {
        type: 'object',
        objectName: listFieldItem.def().name,
      }
    case 'inline_object':
      return {
        type: 'inline_object',
        fieldDefs: getFieldDefEntries(listFieldItem.fields).map(fieldDefEntryToCoreFieldDef),
      }
    case 'document':
      return {
        type: 'document',
        documentName: listFieldItem.def().name,
      }
    default:
      casesHandled(listFieldItem)
  }
}

function collectObjectDefs(documentDefs: DocumentDef[]): ObjectDef[] {
  const objectDefMap: { [objectDefName: string]: ObjectDef } = {}

  const traverseObjectDef = (objectDef: ObjectDef) => {
    if (objectDef.name in objectDefMap) {
      return
    }

    objectDefMap[objectDef.name] = objectDef

    getFieldDefValues(objectDef.fields).forEach(traverseField)
  }

  const traverseField = (field: FieldDef) => {
    switch (field.type) {
      case 'object':
        return traverseObjectDef(field.def())
      case 'inline_object':
        return getFieldDefValues(field.fields).forEach(traverseField)
      case 'polymorphic_list':
        return field.of.forEach(traverseListFieldItem)
      case 'list':
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
      case 'object':
        return traverseObjectDef(listFieldItem.def())
    }
  }

  documentDefs.flatMap((_) => getFieldDefValues(_.fields)).forEach(traverseField)

  return Object.values(objectDefMap)
}
