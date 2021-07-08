import type { Document } from '../data'
import type { FieldDef, FieldDefType } from './field'
export * from './field'
export * from './validate'

export type Markdown = {
  /** Raw Markdown source */
  raw: string
  /** Generated HTML based on Markdown source */
  html: string
}

export type MDX = {
  /** Raw MDX source */
  raw: string
  /** Prebundled via mdx-bundler */
  code: string
}

export type DocumentDefMap = Record<string, DocumentDef>
export type ObjectDefMap = Record<string, ObjectDef>

export type SchemaDef = {
  documentDefMap: DocumentDefMap
  objectDefMap: ObjectDefMap
  /** Hash of the schema def which can be used e.g. for caching purposes. */
  hash: string
}

export type DocumentDef = {
  readonly _tag: 'DocumentDef'
  /** Sometimes also called "id" */
  name: string
  label: string
  description: string | undefined
  labelField: string | undefined
  isSingleton: boolean
  fieldDefs: FieldDef[]
  computedFields: ComputedField[]
}

export type ObjectDef = {
  readonly _tag: 'ObjectDef'
  name: string
  label: string
  description: string | undefined
  labelField: string | undefined
  fieldDefs: FieldDef[]
}

export type ComputedField = {
  name: string
  description: string | undefined
  type: FieldDefType
  resolve: ComputedFieldResolver
}

type ComputedFieldResolver = (_: Document) => FieldDefType | Promise<FieldDefType>
