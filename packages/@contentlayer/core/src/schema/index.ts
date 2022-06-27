import type { Document } from '../data-types.js'
import type { ExtensionsDocumentType, ExtensionsNestedType } from '../extensions.js'
import type { FieldDef, FieldDefType } from './field.js'
export * from './field.js'
export * from './validate.js'

export type DocumentTypeDefMap = Record<string, DocumentTypeDef>
export type NestedTypeDefMap = Record<string, NestedTypeDef>

export type SchemaDef = {
  documentTypeDefMap: DocumentTypeDefMap
  nestedTypeDefMap: NestedTypeDefMap
  /** Hash of the schema def which can be used e.g. for caching purposes. */
  hash: string
}

export type DocumentTypeDef = {
  readonly _tag: 'DocumentTypeDef'
  /** Sometimes also called "id" */
  name: string
  description: string | undefined
  isSingleton: boolean
  fieldDefs: FieldDef[]
  computedFields: ComputedField[]
  extensions: Partial<ExtensionsDocumentType>
}

export type NestedTypeDef = {
  readonly _tag: 'NestedTypeDef'
  name: string
  description: string | undefined
  fieldDefs: FieldDef[]
  extensions: Partial<ExtensionsNestedType>
}

export type NestedUnnamedTypeDef = {
  readonly _tag: 'NestedUnnamedTypeDef'
  fieldDefs: FieldDef[]
  extensions: Partial<ExtensionsNestedType>
}

export type ComputedField = {
  name: string
  description: string | undefined
  type: FieldDefType
  resolve: ComputedFieldResolver
}

export type ComputedFieldResolver = (_: Document) => FieldDefType | Promise<FieldDefType>
