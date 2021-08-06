import type { Document } from '../data'
import type { FieldDef, FieldDefType } from './field'
import type { StackbitExtension } from './stackbit-extension'
export * from './field'
export * from './validate'
export * from './stackbit-extension'

export type TypeDefExtensions = {
  stackbit?: StackbitExtension.TypeExtension
}

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

type ComputedFieldResolver = (_: Document) => FieldDefType | Promise<FieldDefType>
