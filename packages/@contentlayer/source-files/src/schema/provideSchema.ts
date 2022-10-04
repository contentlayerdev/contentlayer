import * as core from '@contentlayer/core'
import * as utils from '@contentlayer/utils'
import { identity, T } from '@contentlayer/utils/effect'

import type { SchemaError } from '../errors/index.js'
import { DuplicateBodyFieldError } from '../errors/index.js'
import * as LocalSchema from './defs/index.js'

export const makeCoreSchema = ({
  documentTypeDefs,
  options,
  esbuildHash,
}: {
  documentTypeDefs: LocalSchema.DocumentTypeDef[]
  options: core.PluginOptions
  esbuildHash: string
}): T.Effect<unknown, SchemaError | utils.HashError, core.SchemaDef> =>
  T.gen(function* ($) {
    const coreDocumentTypeDefMap: core.DocumentTypeDefMap = {}
    const coreNestedTypeDefMap: core.NestedTypeDefMap = {}

    for (const documentDef of documentTypeDefs) {
      validateDefName({ defName: documentDef.name })

      const fieldDefs = getFieldDefEntries(documentDef.fields ?? []).map((_) =>
        fieldDefEntryToCoreFieldDef(_, options.fieldOptions),
      )

      if (fieldDefs.some((_) => _.name === options.fieldOptions.bodyFieldName)) {
        yield* $(T.fail(new DuplicateBodyFieldError({ bodyFieldName: options.fieldOptions.bodyFieldName })))
      }

      // add default body markdown field if not explicitly provided
      if (documentDef.contentType === undefined || documentDef.contentType === 'markdown') {
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
      if (documentDef.contentType === 'mdx') {
        fieldDefs.push({
          type: 'mdx',
          name: options.fieldOptions.bodyFieldName,
          description: 'MDX file body',
          default: undefined,
          isRequired: true,
          isSystemField: true,
        })
      }

      const computedFields = Object.entries(documentDef.computedFields ?? {}).map<core.ComputedField>(
        ([name, computedField]) => ({
          ...utils.pick(computedField, ['description', 'type'], false),
          name,
          // NOTE we need to flip the variance here (casting a core.Document to a LocalDocument)
          resolve: computedField.resolve as core.ComputedFieldResolver,
        }),
      )

      const coreDocumentDef: core.DocumentTypeDef = {
        _tag: 'DocumentTypeDef',
        ...utils.pick(documentDef, ['name', 'description'], false),
        isSingleton: documentDef.isSingleton ?? false,
        fieldDefs,
        computedFields,
        extensions: documentDef.extensions ?? {},
      }
      coreDocumentTypeDefMap[documentDef.name] = coreDocumentDef
    }

    const nestedDefs = collectNestedDefs(documentTypeDefs)
    for (const nestedDef of nestedDefs) {
      validateDefName({ defName: nestedDef.name })

      const coreNestedTypeDef: core.NestedTypeDef = {
        _tag: 'NestedTypeDef',
        ...utils.pick(nestedDef, ['description'], false),
        name: nestedDef.name,
        fieldDefs: getFieldDefEntries(nestedDef.fields ?? []).map((_) =>
          fieldDefEntryToCoreFieldDef(_, options.fieldOptions),
        ),
        extensions: nestedDef.extensions ?? {},
      }
      coreNestedTypeDefMap[coreNestedTypeDef.name] = coreNestedTypeDef
    }

    const coreSchemaDef = {
      documentTypeDefMap: coreDocumentTypeDefMap,
      nestedTypeDefMap: coreNestedTypeDefMap,
      hash: esbuildHash,
    }

    core.validateSchema(coreSchemaDef)

    return coreSchemaDef
  })

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

const fieldDefEntryToCoreFieldDef = (
  [name, fieldDef]: FieldDefEntry,
  fieldOptions: core.FieldOptions,
): core.FieldDef => {
  const baseFields: core.FieldDefBase = {
    ...utils.pick(fieldDef, ['type', 'default', 'description'], false),
    name,
    isRequired: fieldDef.required ?? false,
    isSystemField: false,
  }
  switch (fieldDef.type) {
    case 'list':
      if (LocalSchema.isListPolymorphicFieldDef(fieldDef)) {
        return identity<core.ListPolymorphicFieldDef>({
          ...baseFields,
          type: 'list_polymorphic',
          default: fieldDef.default,
          typeField: fieldDef.typeField ?? fieldOptions.typeFieldName,
          of: fieldDef.of.map((_) => fieldListItemsToCoreFieldListDefItems(_, fieldOptions)),
        })
      }

      return identity<core.ListFieldDef>({
        ...baseFields,
        type: 'list',
        default: fieldDef.default,
        of: fieldListItemsToCoreFieldListDefItems(fieldDef.of, fieldOptions),
      })
    case 'nested':
      if (LocalSchema.isNestedPolymorphicFieldDef(fieldDef)) {
        const nestedTypeDefs = fieldDef.of.map((_) => _.def())
        const containsUnnamedTypeDef = nestedTypeDefs.some(LocalSchema.isNestedUnnamedTypeDef)
        if (containsUnnamedTypeDef) {
          throw new Error(`Nested unnamed polymorphic type definitions are not yet supported.`)
        }
        const nestedTypeNames = nestedTypeDefs.map((_: any) => _.name as string)
        return identity<core.NestedPolymorphicFieldDef>({
          ...baseFields,
          type: 'nested_polymorphic',
          default: fieldDef.default,
          nestedTypeNames,
          typeField: fieldDef.typeField ?? fieldOptions.typeFieldName,
        })
      }

      const nestedTypeDef = fieldDef.of.def()
      if (LocalSchema.isNestedTypeDef(nestedTypeDef)) {
        return identity<core.NestedFieldDef>({
          ...baseFields,
          type: 'nested',
          default: fieldDef.default,
          nestedTypeName: nestedTypeDef.name,
        })
      }

      const fieldDefs = getFieldDefEntries(nestedTypeDef.fields ?? []).map((_) =>
        fieldDefEntryToCoreFieldDef(_, fieldOptions),
      )
      const extensions = nestedTypeDef.extensions ?? {}
      const typeDef: core.NestedUnnamedTypeDef = { _tag: 'NestedUnnamedTypeDef', fieldDefs, extensions }
      return identity<core.NestedUnnamedFieldDef>({
        ...baseFields,
        type: 'nested_unnamed',
        default: fieldDef.default,
        typeDef,
      })
    case 'reference':
      if (LocalSchema.isReferencePolymorphicFieldDef(fieldDef)) {
        const documentTypeNames = fieldDef.of.map((_) => _.def().name)
        return identity<core.ReferencePolymorphicFieldDef>({
          ...baseFields,
          type: 'reference_polymorphic',
          default: fieldDef.default,
          documentTypeNames,
          typeField: fieldDef.typeField ?? fieldOptions.typeFieldName,
        })
      }
      return identity<core.ReferenceFieldDef>({
        ...baseFields,
        type: 'reference',
        default: fieldDef.default,
        documentTypeName: fieldDef.of.def().name,
        embedDocument: fieldDef.embedDocument ?? false,
      })
    case 'enum':
      return identity<core.EnumFieldDef>({
        ...baseFields,
        type: 'enum',
        default: fieldDef.default,
        options: fieldDef.options,
      })
    case 'boolean':
    case 'date':
    case 'image':
    case 'json':
    case 'markdown':
    case 'mdx':
    case 'number':
    case 'string':
      return {
        // needs to pick again since fieldDef.type has been
        ...utils.pick(fieldDef, ['type', 'default', 'description'], false),
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
  fieldOptions: core.FieldOptions,
): core.ListFieldDefItem.Item => {
  switch (listFieldDefItem.type) {
    case 'boolean':
    case 'string':
    case 'number':
    case 'date':
    case 'json':
    case 'markdown':
    case 'mdx':
    case 'image':
      return utils.pick(listFieldDefItem, ['type'], false)
    case 'enum':
      return {
        type: 'enum',
        options: listFieldDefItem.options,
      }
    case 'nested':
      const nestedTypeDef = listFieldDefItem.def()
      if (LocalSchema.isNestedTypeDef(nestedTypeDef)) {
        return { type: 'nested', nestedTypeName: nestedTypeDef.name }
      }

      const fieldDefs = getFieldDefEntries(nestedTypeDef.fields ?? []).map((_) =>
        fieldDefEntryToCoreFieldDef(_, fieldOptions),
      )
      const extensions = nestedTypeDef.extensions ?? {}
      const typeDef: core.NestedUnnamedTypeDef = { _tag: 'NestedUnnamedTypeDef', fieldDefs, extensions }
      return { type: 'nested_unnamed', typeDef }
    case 'document':
      return {
        type: 'reference',
        documentTypeName: listFieldDefItem.def().name,
        embedDocument: listFieldDefItem.embedDocument ?? false,
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

    getFieldDefValues(objectDef.fields ?? []).forEach(traverseField)
  }

  const traverseField = (fieldDef: LocalSchema.FieldDef): void => {
    switch (fieldDef.type) {
      case 'nested':
        if (utils.isReadonlyArray(fieldDef.of)) {
          const nestedTypeDefs = fieldDef.of.map((_) => _.def())
          return nestedTypeDefs.forEach((nestedTypeDef) => {
            if (LocalSchema.isNestedTypeDef(nestedTypeDef)) {
              return traverseNestedDef(nestedTypeDef)
            }
            return getFieldDefValues(nestedTypeDef.fields ?? []).forEach(traverseField)
          })
        }

        const nestedTypeDef = fieldDef.of.def()
        if (LocalSchema.isNestedTypeDef(nestedTypeDef)) {
          return traverseNestedDef(nestedTypeDef)
        }
        return getFieldDefValues(nestedTypeDef.fields ?? []).forEach(traverseField)
      case 'list':
        if (LocalSchema.isListPolymorphicFieldDef(fieldDef)) {
          return fieldDef.of.forEach(traverseListFieldItem)
        }
        return traverseListFieldItem(fieldDef.of)
      case 'image':
      case 'boolean':
      case 'date':
      case 'enum':
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
        if (LocalSchema.isNestedUnnamedTypeDef(nestedTypeDef)) {
          return getFieldDefValues(nestedTypeDef.fields ?? []).forEach(traverseField)
        }
        return traverseNestedDef(nestedTypeDef)
    }
  }

  documentDefs.flatMap((_) => getFieldDefValues(_.fields ?? [])).forEach(traverseField)

  return Object.values(objectDefMap)
}
