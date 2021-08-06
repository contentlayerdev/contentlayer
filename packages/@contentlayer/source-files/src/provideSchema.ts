import * as core from '@contentlayer/core'
import * as utils from '@contentlayer/utils'

import type * as LocalSchema from './schema'
import {
  isListPolymorphicFieldDef,
  isNestedPolymorphicFieldDef,
  isNestedTypeDef,
  isNestedUnnamedTypeDef,
  isReferencePolymorphicFieldDef,
} from './schema'

export const makeCoreSchema = (({
  schemaDef,
  options,
}: {
  schemaDef: LocalSchema.SchemaDef
  options: core.PluginOptions
}): core.SchemaDef => {
  const coreDocumentTypeDefMap: core.DocumentTypeDefMap = {}
  const coreNestedTypeDefMap: core.NestedTypeDefMap = {}

  for (const documentDef of schemaDef.documentTypeDefs) {
    validateDefName({ defName: documentDef.name })

    const fieldDefs = getFieldDefEntries(documentDef.fields).map(fieldDefEntryToCoreFieldDef)

    if (fieldDefs.some((_) => _.name === 'body')) {
      // NOTE maybe we should later allow overriding the "body" field
      throw new Error(
        `You cannot override the "body" field in a document definition. Please use the "contentType" field instead.`,
      )
    }

    // add default body markdown field if not explicitly provided
    if (documentDef.bodyType === undefined || documentDef.bodyType === 'markdown') {
      fieldDefs.push({
        type: 'markdown',
        name: options.fieldOptions.bodyFieldName,
        description: 'Markdown file body',
        default: undefined,
        isRequired: true,
        isSystemField: true,
      })
    }

    // add default body MDX field if not explicitly provided
    if (documentDef.bodyType === 'mdx') {
      fieldDefs.push({
        type: 'mdx',
        name: options.fieldOptions.bodyFieldName,
        description: 'MDX file body',
        default: undefined,
        isRequired: true,
        isSystemField: true,
      })
    }

    // const mapFieldDefType = (fieldDefType: FieldDefType): Core.FieldDefType =>
    //   fieldDefType === 'reference' ? 'reference' : fieldDefType

    const computedFields = Object.entries(documentDef.computedFields ?? {}).map<core.ComputedField>(
      ([name, computedField]) => ({
        ...utils.pick(computedField, ['description', 'resolve', 'type']),
        name,
        // type: mapFieldDefType(computedField.type),
      }),
    )

    const coreDocumentDef: core.DocumentTypeDef = {
      _tag: 'DocumentTypeDef',
      ...utils.pick(documentDef, ['name', 'description']),
      isSingleton: documentDef.isSingleton ?? false,
      fieldDefs,
      computedFields,
      extensions: documentDef.extensions ?? {},
    }
    coreDocumentTypeDefMap[documentDef.name] = coreDocumentDef
  }

  const nestedDefs = collectNestedDefs(schemaDef.documentTypeDefs)
  for (const nestedDef of nestedDefs) {
    validateDefName({ defName: nestedDef.name })

    const coreNestedTypeDef: core.NestedTypeDef = {
      _tag: 'NestedTypeDef',
      ...utils.pick(nestedDef, ['description']),
      name: nestedDef.name,
      fieldDefs: getFieldDefEntries(nestedDef.fields).map(fieldDefEntryToCoreFieldDef),
      extensions: nestedDef.extensions ?? {},
    }
    coreNestedTypeDefMap[coreNestedTypeDef.name] = coreNestedTypeDef
  }

  const defs = { documentTypeDefMap: coreDocumentTypeDefMap, nestedTypeDefMap: coreNestedTypeDefMap }
  const hash = core.hashObject({ defs, options })

  const coreSchemaDef = { ...defs, hash }

  core.validateSchema(coreSchemaDef)

  return coreSchemaDef
})['|>'](utils.traceFn('@contentlayer/source-local:makeCoreSchema', ['schemaDef', 'options']))

const validateDefName = ({ defName }: { defName: string }): void => {
  const firstChar = defName.charAt(0)
  if (firstChar.toLowerCase() === firstChar) {
    const improvedDefName = utils.uppercaseFirstChar(defName)
    console.warn(`\
Warning: A document or nested definition name should start with a uppercase letter.
You've provided the name "${defName}" - please consider using "${improvedDefName}" instead.
`)
  }
}

const getFieldDefEntries = (fieldDefs: LocalSchema.FieldDefs): FieldDefEntry[] => {
  if (Array.isArray(fieldDefs)) {
    return fieldDefs.map((fieldDef) => [fieldDef.name, fieldDef])
  } else {
    return Object.entries(fieldDefs)
  }
}

const getFieldDefValues = (fieldDefs: LocalSchema.FieldDefs): LocalSchema.FieldDef[] => {
  if (Array.isArray(fieldDefs)) {
    return fieldDefs
  } else {
    return Object.values(fieldDefs)
  }
}

type FieldDefEntry = [fieldName: string, fieldDef: LocalSchema.FieldDef]

const fieldDefEntryToCoreFieldDef = ([name, fieldDef]: FieldDefEntry): core.FieldDef => {
  const baseFields: core.FieldDefBase = {
    ...utils.pick(fieldDef, ['type', 'default', 'description']),
    name,
    isRequired: fieldDef.required ?? false,
    isSystemField: false,
  }
  switch (fieldDef.type) {
    case 'list':
      if (isListPolymorphicFieldDef(fieldDef)) {
        return <core.ListPolymorphicFieldDef>{
          ...baseFields,
          type: 'list_polymorphic',
          typeField: fieldDef.typeField,
          of: fieldDef.of.map(fieldListItemsToCoreFieldListDefItems),
        }
      }

      return <core.ListFieldDef>{ ...baseFields, of: fieldListItemsToCoreFieldListDefItems(fieldDef.of) }
    case 'nested':
      if (isNestedPolymorphicFieldDef(fieldDef)) {
        const nestedTypeDefs = fieldDef.of.map((_) => _.def())
        const containsUnnamedTypeDef = nestedTypeDefs.some(isNestedUnnamedTypeDef)
        if (containsUnnamedTypeDef) {
          throw new Error(`Nested unnamed polymorphic type definitions are not yet supported.`)
        }
        const nestedTypeNames = nestedTypeDefs.map((_: any) => _.name as string)
        return <core.NestedPolymorphicFieldDef>{
          ...baseFields,
          type: 'nested_polymorphic',
          nestedTypeNames,
          typeField: fieldDef.typeField,
        }
      }

      const nestedTypeDef = fieldDef.of.def()
      if (isNestedTypeDef(nestedTypeDef)) {
        return <core.NestedFieldDef>{ ...baseFields, nestedTypeName: nestedTypeDef.name }
      }

      const fieldDefs = getFieldDefEntries(nestedTypeDef.fields).map(fieldDefEntryToCoreFieldDef)
      const extensions = nestedTypeDef.extensions ?? {}
      const typeDef: core.NestedUnnamedTypeDef = { _tag: 'NestedUnnamedTypeDef', fieldDefs, extensions }
      return <core.NestedUnnamedFieldDef>{ ...baseFields, type: 'nested_unnamed', typeDef }
    case 'reference':
      if (isReferencePolymorphicFieldDef(fieldDef)) {
        const documentTypeNames = fieldDef.of.map((_) => _.def().name)
        return <core.ReferencePolymorphicFieldDef>{
          ...baseFields,
          type: 'reference_polymorphic',
          documentTypeNames,
          typeField: fieldDef.typeField,
        }
      }
      return <core.ReferenceFieldDef>{ ...baseFields, documentTypeName: fieldDef.of.def().name }
    case 'enum':
      return <core.EnumFieldDef>{ ...baseFields, options: fieldDef.options }
    case 'boolean':
    case 'date':
    // case 'image':
    case 'json':
    case 'markdown':
    case 'mdx':
    case 'number':
    // case 'slug':
    case 'string':
      // case 'text':
      // case 'url':
      return {
        // needs to pick again since fieldDef.type has been
        ...utils.pick(fieldDef, ['type', 'default', 'description']),
        isRequired: fieldDef.required ?? false,
        name,
        isSystemField: false,
      }
    default:
      utils.casesHandled(fieldDef)
  }
}

const fieldListItemsToCoreFieldListDefItems = (
  listFieldDefItem: LocalSchema.ListFieldDefItem.Item,
): core.ListFieldDefItem.Item => {
  switch (listFieldDefItem.type) {
    case 'boolean':
    case 'string':
      return utils.pick(listFieldDefItem, ['type'])
    case 'enum':
      return {
        type: 'enum',
        options: listFieldDefItem.options,
      }
    case 'nested':
      const nestedTypeDef = listFieldDefItem.def()
      if (isNestedTypeDef(nestedTypeDef)) {
        return { type: 'nested', nestedTypeName: nestedTypeDef.name }
      }

      const fieldDefs = getFieldDefEntries(nestedTypeDef.fields).map(fieldDefEntryToCoreFieldDef)
      const extensions = nestedTypeDef.extensions ?? {}
      const typeDef: core.NestedUnnamedTypeDef = { _tag: 'NestedUnnamedTypeDef', fieldDefs, extensions }
      return { type: 'nested_unnamed', typeDef }
    case 'document':
      return {
        type: 'reference',
        documentTypeName: listFieldDefItem.def().name,
      }
    default:
      utils.casesHandled(listFieldDefItem)
  }
}

const collectNestedDefs = (documentDefs: LocalSchema.DocumentTypeDef[]): LocalSchema.NestedTypeDef[] => {
  const objectDefMap: { [objectDefName: string]: LocalSchema.NestedTypeDef } = {}

  const traverseNestedDef = (objectDef: LocalSchema.NestedTypeDef) => {
    if (objectDef.name in objectDefMap) {
      return
    }

    objectDefMap[objectDef.name] = objectDef

    getFieldDefValues(objectDef.fields).forEach(traverseField)
  }

  const traverseField = (fieldDef: LocalSchema.FieldDef): void => {
    switch (fieldDef.type) {
      case 'nested':
        if (Array.isArray(fieldDef.of)) {
          const nestedTypeDefs = fieldDef.of.map((_) => _.def())
          return nestedTypeDefs.forEach((nestedTypeDef) => {
            if (isNestedTypeDef(nestedTypeDef)) {
              return traverseNestedDef(nestedTypeDef)
            }
            return getFieldDefValues(nestedTypeDef.fields).forEach(traverseField)
          })
        }

        const nestedTypeDef = fieldDef.of.def()
        if (isNestedTypeDef(nestedTypeDef)) {
          return traverseNestedDef(nestedTypeDef)
        }
        return getFieldDefValues(nestedTypeDef.fields).forEach(traverseField)
      case 'list':
        if (isListPolymorphicFieldDef(fieldDef)) {
          return fieldDef.of.forEach(traverseListFieldItem)
        }
        return traverseListFieldItem(fieldDef.of)
      case 'boolean':
      case 'date':
      case 'enum':
      // case 'image':
      case 'json':
      case 'markdown':
      case 'mdx':
      case 'number':
      // case 'slug':
      case 'string':
      // case 'text':
      // case 'url':
      case 'reference':
        return
      default:
        utils.casesHandled(fieldDef)
    }
  }

  const traverseListFieldItem = (listFieldDefItem: LocalSchema.ListFieldDefItem.Item) => {
    switch (listFieldDefItem.type) {
      case 'nested':
        const nestedTypeDef = listFieldDefItem.def()
        if (isNestedUnnamedTypeDef(nestedTypeDef)) {
          return getFieldDefValues(nestedTypeDef.fields).forEach(traverseField)
        }
        return traverseNestedDef(nestedTypeDef)
    }
  }

  documentDefs.flatMap((_) => getFieldDefValues(_.fields)).forEach(traverseField)

  return Object.values(objectDefMap)
}
