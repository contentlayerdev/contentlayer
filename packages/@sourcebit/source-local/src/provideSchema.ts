import type * as Core from '@sourcebit/core'
import {
  DocumentDef,
  FieldDef,
  isListField,
  isListFieldItemsObject,
  isObjectField,
  ListFieldItems,
  ObjectDef,
  SchemaDef,
} from './schema'
import { pick, unwrapThunk } from './utils'

export function makeStaticSchema(schemaDef: SchemaDef): Core.SchemaDef {
  const coreDocumentDefMap: Core.DocumentDefMap = {}
  const coreObjectDefMap: Core.ObjectDefMap = {}

  for (const documentDef of schemaDef.documentDefs) {
    const coreDocumentDef: Core.DocumentDef = {
      ...pick(documentDef, ['name', 'label', 'description', 'labelField']),
      fieldDefs: unwrapThunk(documentDef.fields).map(fieldDefToCoreFieldDef),
      computedFields: (documentDef.computedFields?.((_) => _) as Core.ComputedField[]) ?? [],
    }
    coreDocumentDefMap[documentDef.name] = coreDocumentDef
  }

  const objectDefs = collectObjectDefs(schemaDef.documentDefs)
  for (const objectDef of objectDefs) {
    const coreObjectDef: Core.ObjectDef = {
      ...pick(objectDef, ['name', 'label', 'description', 'labelField']),
      fieldDefs: unwrapThunk(objectDef.fields).map(fieldDefToCoreFieldDef),
    }
    coreObjectDefMap[coreObjectDef.name] = coreObjectDef
  }

  return { documentDefMap: coreDocumentDefMap, objectDefMap: coreObjectDefMap }
}

function fieldDefToCoreFieldDef(fieldDef: FieldDef): Core.FieldDef {
  const baseFields = pick(fieldDef, ['name', 'type', 'default', 'label', 'description', 'required', 'const', 'hidden'])
  switch (fieldDef.type) {
    case 'list':
      return <Core.ListFieldDef>{ ...baseFields, items: fieldListItemsToCoreFieldListDefItems(fieldDef.items) }
    case 'object':
      return <Core.ObjectFieldDef>{ ...baseFields, objectName: unwrapThunk(fieldDef.object).name }
    case 'reference':
      return <Core.ReferenceFieldDef>{ ...baseFields, documentName: fieldDef.document.name }
    default:
      return { ...fieldDef }
  }
}

function fieldListItemsToCoreFieldListDefItems(listFieldItems: ListFieldItems): Core.ListFieldDefItems {
  // const baseFields =
  switch (listFieldItems.type) {
    case 'boolean':
    case 'string':
      return pick(listFieldItems, ['labelField', 'type'])
    case 'object':
      const objectNames = wrapInArray(unwrapThunk(listFieldItems.object)).map((_) => _.name)
      return { type: 'object', labelField: listFieldItems.labelField, objectNames }
  }
}

function wrapInArray<T>(_: T | T[]): T[] {
  return Array.isArray(_) ? _ : [_]
}

function collectObjectDefs(documentDefs: DocumentDef[]): ObjectDef[] {
  const objectDefMap: { [objectDefName: string]: ObjectDef } = {}

  const traverseObjectDef = (objectDef: ObjectDef) => {
    if (objectDef.name in objectDefMap) {
      return
    }

    objectDefMap[objectDef.name] = objectDef

    unwrapThunk(objectDef.fields)
      .filter(isObjectField)
      .map((_) => _.object)
      .map(unwrapThunk)
      .forEach(traverseObjectDef)

    unwrapThunk(objectDef.fields)
      .filter(isListField)
      .map((_) => _.items)
      .filter(isListFieldItemsObject)
      .map((_) => _.object)
      .map(unwrapThunk)
      .flatMap((_) => (Array.isArray(_) ? _ : [_]))
      .forEach(traverseObjectDef)
    // .forEach((_) => console.log('list', _))
  }

  documentDefs.forEach((documentDef) =>
    unwrapThunk(documentDef.fields)
      .filter(isObjectField)
      .map((_) => _.object)
      .map(unwrapThunk)
      .forEach(traverseObjectDef),
  )

  documentDefs.forEach((documentDef) =>
    unwrapThunk(documentDef.fields)
      .filter(isListField)
      .map((_) => _.items)
      .filter(isListFieldItemsObject)
      .map((_) => _.object)
      .map(unwrapThunk)
      .flatMap((_) => (Array.isArray(_) ? _ : [_]))
      .forEach(traverseObjectDef),
  )

  return Object.values(objectDefMap)
}
