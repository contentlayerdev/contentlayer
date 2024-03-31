import { mapObjectValues } from '@contentlayer2/utils'

import type { Contentful } from './types.js'

export namespace Input {
  export type SchemaOverrides = {
    nestedTypes?: TypeOverrideValues
    documentTypes?: TypeOverrideValues
  }

  export type TypeOverrideValues = (string | TypeOverrideMap)[] | TypeOverrideMap

  /** Map from Contentful content type id to your own type name */
  export type ContentTypeId = string
  export type TypeOverrideMap = Record<ContentTypeId, string | TypeOverrideItem>

  export type TypeOverrideItem = { defName: string; isSingleton?: boolean; fields?: FieldOverrideMap }

  export type FieldName = string
  export type FieldOverrideMap = Record<FieldName, FieldOverrideItem>
  export type FieldOverrideItem = { name?: string; type?: 'markdown' }
}

export namespace Normalized {
  export type TypeOverrideMap = Record<string, TypeOverrideItem>

  export type TypeOverrideItem = { defName: string; isSingleton: boolean; fields: FieldOverrideMap }

  export type FieldOverrideMap = Record<Input.FieldName, FieldOverrideItem>
  // TODO extend type overrriding beyond markdown
  export type FieldOverrideItem = { name: string; type?: 'markdown' }

  export type SchemaOverrides = {
    nestedTypes: TypeOverrideMap
    documentTypes: TypeOverrideMap
  }
}

export const normalizeSchemaOverrides = ({
  contentTypes,
  schemaOverrides,
}: {
  contentTypes: Contentful.ContentType[]
  schemaOverrides: Input.SchemaOverrides
}): Normalized.SchemaOverrides => {
  const overrideDocumentContentTypeIds = getContentTypeIds(schemaOverrides.documentTypes ?? {})
  const overrideNestedContentTypeIds = getContentTypeIds(schemaOverrides.nestedTypes ?? {})
  const contentfulContentTypeIds = contentTypes.map((_) => _.sys.id)

  // check whether type names were provided that don't exist in Contentful
  const unknownContentTypeIds = [...overrideDocumentContentTypeIds, ...overrideNestedContentTypeIds].filter(
    (typeName) => !contentfulContentTypeIds.includes(typeName),
  )
  if (unknownContentTypeIds.length > 0) {
    throw new Error(`\
Unknown Contentful content type id(s) provided: ${unknownContentTypeIds.join(', ')}.
Please only use the following Contentful content type ids:
${contentfulContentTypeIds.map((_) => `  - ${_}`).join('\n')}
`)
  }

  if (schemaOverrides.documentTypes && schemaOverrides.nestedTypes) {
    const providedContentTypeIds = [...overrideDocumentContentTypeIds, ...overrideNestedContentTypeIds]

    // in case both documentTypes and nestedTypes were provided, make sure no Contentful content type was forgotten
    const forgottenContentTypeIds = contentfulContentTypeIds.filter(
      (typeName) => !providedContentTypeIds.includes(typeName),
    )

    if (forgottenContentTypeIds.length > 0) {
      throw new Error(`\
When providing both the "documentTypes" and "nestedTypes" schemaOverrides options you need to cover all Contentful content types.
The following content types are missing and need to be provided either in "documentTypes" or "nestedTypes":
${forgottenContentTypeIds.map((_) => `  - ${_}`).join('\n')}
`)
    }

    // check that no content types are mentioned for both options
    const duplicateContentTypeIds = overrideDocumentContentTypeIds.filter((typeName) =>
      overrideNestedContentTypeIds.includes(typeName),
    )
    if (duplicateContentTypeIds.length > 0) {
      throw new Error(`\
The following content types were provided both in "documentTypes" and "nestedTypes" but can only be specified on one sid:
${duplicateContentTypeIds.map((_) => `  - ${_}`).join('\n')}
`)
    }
  }

  const normalizeSchemaOverrides: Normalized.SchemaOverrides = {
    documentTypes: normalizeInputTypeValues(
      schemaOverrides.documentTypes ??
        getCompilementTypeNames({
          allTypeNames: contentfulContentTypeIds,
          providedTypeNames: overrideNestedContentTypeIds,
        }),
    ),
    nestedTypes: normalizeInputTypeValues(
      schemaOverrides.nestedTypes ??
        getCompilementTypeNames({
          allTypeNames: contentfulContentTypeIds,
          providedTypeNames: overrideDocumentContentTypeIds,
        }),
    ),
  }

  return normalizeSchemaOverrides
}

const normalizeInputTypeValues = (types: Input.TypeOverrideValues): Normalized.TypeOverrideMap => {
  if (Array.isArray(types)) {
    return types.reduce<Normalized.TypeOverrideMap>(
      (acc, type_) =>
        typeof type_ === 'object'
          ? { ...acc, ...normalizeInputTypeOverrideMap(type_) }
          : { ...acc, [type_]: { defName: type_, isSingleton: false, fields: {} } },
      {},
    )
  }

  return normalizeInputTypeOverrideMap(types)
}

const normalizeInputTypeOverrideMap = (mapping: Input.TypeOverrideMap): Normalized.TypeOverrideMap =>
  mapObjectValues(mapping, (_key, item) => normalizeInputTypeOverrideItem(item))

const normalizeInputTypeOverrideItem = (item: Input.TypeOverrideItem | string): Normalized.TypeOverrideItem => {
  if (typeof item === 'string') {
    return { isSingleton: false, fields: {}, defName: item }
  }

  const fields = item.fields ? normalizeInputFieldOverrideMap(item.fields) : {}
  const isSingleton = item.isSingleton ?? false

  return { isSingleton, fields, defName: item.defName }
}

const normalizeInputFieldOverrideMap = (map: Input.FieldOverrideMap): Normalized.FieldOverrideMap => {
  return mapObjectValues(
    map,
    (fieldName, item) => <Normalized.FieldOverrideItem>{ name: item.name ?? fieldName, type: item.type },
  )
}

const getContentTypeIds = (types: Input.TypeOverrideValues): string[] => {
  if (Array.isArray(types)) {
    return types.flatMap((type_) => (typeof type_ === 'object' ? Object.keys(type_) : [type_]))
  }

  return Object.keys(types)
}

const getCompilementTypeNames = ({
  allTypeNames,
  providedTypeNames,
}: {
  allTypeNames: string[]
  providedTypeNames: string[]
}): string[] => {
  return allTypeNames.filter((typeName) => !providedTypeNames.includes(typeName))
}

// type Required<T> = T extends object ? { [P in keyof T]-?: NonNullable<T[P]> } : T
// type DeepRequired<T, U extends object | undefined = undefined> = T extends object
//   ? {
//       [P in keyof T]-?: NonNullable<T[P]> extends NonNullable<U | Function>
//         ? NonNullable<T[P]>
//         : DeepRequired<NonNullable<T[P]>, U>
//     }
//   : T
