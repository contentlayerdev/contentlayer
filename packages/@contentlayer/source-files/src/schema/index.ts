import type * as core from '@contentlayer/core'

import type { ComputedField } from './computed-field'
import type { FieldDef, FieldDefWithName } from './field'

export * from './field'

export type SchemaDef = {
  documentTypeDefs: DocumentTypeDef[]
}

export type DocumentBodyType = 'markdown' | 'mdx' | 'none'

export type TypeExtensions<DefName extends string = string> = {
  stackbit?: core.StackbitExtension.TypeExtension<DefName>
}

export type FieldDefs = Record<string, FieldDef> | FieldDefWithName[]

/** Top level model type */
export type DocumentTypeDef<DefName extends string = string> = {
  // type: 'DocumentTypeDef'
  name: DefName
  // type: ModelType
  description?: string

  /**
   * The field definitions can either be provided as an embedded with the field names as keys or
   * as an array of all field definitions including the name as an extra field. (The array definition
   * can be used if you want more control over the order of the fields.)
   *
   * In the case of `fileType: "md"` the fields are used for the frontmatter
   * and have an implicit field called `content` with the markdown body.
   */
  fields: FieldDefs

  computedFields?: Record<string, ComputedField<DefName>>

  /** Path is relative to the `contentDirPath` config */
  filePathPattern?: string // | ((doc: Document) => string)
  /** Default is `markdown` */
  bodyType?: DocumentBodyType
  isSingleton?: boolean

  extensions?: TypeExtensions<DefName>
}

export type NestedTypeDef<DefName extends string = string> = {
  // type: 'NestedTypeDef'
  name: DefName
  description?: string
  fields: FieldDefs
  extensions?: TypeExtensions<DefName>
}

export const isNestedTypeDef = (_: NestedTypeDef | NestedUnnamedTypeDef): _ is NestedTypeDef => _.hasOwnProperty('name')

export type NestedUnnamedTypeDef = {
  // type: 'NestedUnnamedTypeDef'
  fields: FieldDefs
  extensions?: TypeExtensions
}

export const isNestedUnnamedTypeDef = (_: NestedTypeDef | NestedUnnamedTypeDef): _ is NestedUnnamedTypeDef =>
  !_.hasOwnProperty('name')

// export type FieldType =
//   | 'string'
//   | 'text'
//   | 'slug'
//   /** Reference to owned embedded, (= "inline model") */
//   | 'nested'
//   // /** Reference to owned model */
//   // | 'model'
//   /** Reference to document */
//   | 'reference'

export type Thunk<T> = () => T

export type NestedType<DefName extends string = string> = {
  type: 'nested'
  def: Thunk<NestedTypeDef<DefName> | NestedUnnamedTypeDef>
}

export type DocumentType<DefName extends string = string> = { type: 'document'; def: Thunk<DocumentTypeDef<DefName>> }

export const defineNestedType = <DefName extends string>(
  def: Thunk<NestedTypeDef<DefName> | NestedUnnamedTypeDef>,
): NestedType<DefName> => ({
  type: 'nested',
  def,
})

export const defineDocumentType = <DefName extends string>(
  def: Thunk<DocumentTypeDef<DefName>>,
): DocumentType<DefName> => ({
  type: 'document',
  def,
})

// export const defineSchema = (_: SchemaDef): SchemaDef => _
