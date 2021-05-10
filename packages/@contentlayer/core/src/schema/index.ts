import { Document } from '../data'
import { FieldDef } from './field'
export * from './field'

export type DocumentDefMap = Record<string, DocumentDef>
export type ObjectDefMap = Record<string, ObjectDef>

export type SchemaDef = {
  documentDefMap: DocumentDefMap
  objectDefMap: ObjectDefMap
}

export type DocumentDef = {
  name: string
  label: string
  description?: string
  labelField?: string
  fieldDefs: FieldDef[]
  computedFields: ComputedField[]
}

export type ObjectDef = {
  name: string
  label: string
  description?: string
  labelField?: string
  fieldDefs: FieldDef[]
}

export type ComputedFieldType = 'string' | 'number' | 'boolean'

export type ComputedField = {
  name: string
  description?: string
  type: ComputedFieldType
  resolve: ComputedFieldResolver
}

type ComputedFieldResolver = (_: Document) => ComputedFieldType | Promise<ComputedFieldType>
