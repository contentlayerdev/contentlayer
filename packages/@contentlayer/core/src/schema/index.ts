import type { Document } from '../data-types.js'
import type { FieldDef, FieldDefType } from './field.js'
import type { StackbitExtension } from './stackbit-extension.js'
export * from './field.js'
export * from './validate.js'
export * from './stackbit-extension.js'

export type TypeDefExtensions = {
  stackbit?: StackbitExtension.TypeExtension
}

export type DocumentTypeDefMap = Record<string, DocumentTypeDef>
export type NestedTypeDefMap = Record<string, NestedTypeDef>

export type DocumentTypeTag = (DocumentTypeDef | NestedTypeDef | NestedUnnamedTypeDef)['_tag']

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
  extensions: TypeDefExtensions
}

export type NestedTypeDef = {
  readonly _tag: 'NestedTypeDef'
  name: string
  description: string | undefined
  fieldDefs: FieldDef[]
  extensions: TypeDefExtensions
}

export type NestedUnnamedTypeDef = {
  readonly _tag: 'NestedUnnamedTypeDef'
  fieldDefs: FieldDef[]
  extensions: TypeDefExtensions
}

export type ComputedField = {
  name: string
  description: string | undefined
  type: FieldDefType
  resolve: ComputedFieldResolver
}

export type ComputedFieldResolver = (_: Document) => FieldDefType | Promise<FieldDefType>
