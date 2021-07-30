import type { StackbitExtension } from '@contentlayer/core'

import type { ComputedField } from './computed-field'

export type SchemaDef = {
  documentDefs: DocumentTypeDef[]
}

export type DocumentFileType = 'markdown' | 'mdx' | 'json' | 'yaml'

export type TypeExtensions<DefName extends string = string> = {
  stackbit?: StackbitExtension.TypeExtension<DefName>
}

export type FieldDefs = Record<string, FieldDef> | FieldDefWithName[]

/** Top level model type */
export type DocumentTypeDef<DefName extends string = string> = {
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
  filePathPattern: string // | ((doc: Document) => string)
  /** Default is `md` */
  fileType?: DocumentFileType
  isSingleton?: boolean

  extensions?: TypeExtensions<DefName>
}

export type NestedTypeDef<DefName extends string = string> = {
  name: DefName
  description?: string
  fields: FieldDefs
  extensions?: TypeExtensions<DefName>
}

export const isNestedTypeDef = (_: NestedTypeDef | UnnamedNestedTypeDef): _ is NestedTypeDef => _.hasOwnProperty('name')

export type UnnamedNestedTypeDef = {
  fields: FieldDefs
  extensions?: TypeExtensions
}

export const isUnnamedNestedTypeDef = (_: NestedTypeDef | UnnamedNestedTypeDef): _ is UnnamedNestedTypeDef =>
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

export type FieldDefType = FieldDef['type']

export type FieldDefWithName = FieldDef & { name: string }

export type FieldDef =
  | ListField
  | PolymorphicListField
  | StringField
  | NumberField
  | BooleanField
  | JSONField
  | SlugField
  | DateField
  | MarkdownField
  | MDXField
  | TextField
  | UrlField
  | ImageField
  | NestedTypeField
  | ReferenceField
  | EnumField

/** Field name should contain only alphanumeric characters, underscore and a hyphen [A-Za-z0-9_]. Must start with a letter. Must not end with an underscore or a hyphen. */
interface FieldBase {
  /** Short description to editors how the field is to be used */
  description?: string
  /**
   * Whether the field is required or not. Fields are optional by default.
   * @default false
   */
  required?: boolean
}

export interface ListField extends FieldBase {
  type: 'list'
  default?: any[]
  of: ListFieldItem
}

export interface PolymorphicListField extends FieldBase {
  type: 'list'
  default?: any[]
  of: ListFieldItem[]
  /** Field needed to distiguish list data items at run time */
  typeField: string
}

export const isListField = (_: FieldDef): _ is ListField => _.type === 'list' && !Array.isArray(_.of)
export const isPolymorphicListField = (_: FieldDef): _ is PolymorphicListField =>
  _.type === 'list' && Array.isArray(_.of)

export type ListFieldItem =
  | ListFieldItemString
  | ListFieldItemEnum
  | ListFieldItemBoolean
  | ListFieldItemNestedType
  | ListFieldItemDocumentReference

export type ListFieldItemString = { type: 'string' }
export type ListFieldItemEnum = { type: 'enum'; options: string[] }
export type ListFieldItemBoolean = { type: 'boolean' }
export type ListFieldItemNestedType = NestedType
export type ListFieldItemDocumentReference = DocumentType

export const isListFieldItemEmbedded = (_: ListFieldItem): _ is ListFieldItemNestedType => _.type === 'nested'

export type StringField = FieldBase & {
  type: 'string'
  default?: string
}

export type NumberField = FieldBase & {
  type: 'number'
  default?: number
}

export type BooleanField = FieldBase & {
  type: 'boolean'
  default?: boolean
}

export type JSONField = FieldBase & {
  type: 'json'
  default?: any
}

// TODO why is this field type needed?
export type SlugField = FieldBase & {
  type: 'slug'
  default?: string
}

export type DateField = FieldBase & {
  type: 'date'
  default?: string
}

export type MarkdownField = FieldBase & {
  type: 'markdown'
  default?: string
}

export type MDXField = FieldBase & {
  type: 'mdx'
  default?: string
}

// why is this field type needed?
export type TextField = FieldBase & {
  type: 'text'
  default?: string
}

export type UrlField = FieldBase & {
  type: 'url'
  default?: string
}

export type ImageField = FieldBase & {
  type: 'image'
  default?: string
}

export type EnumField = FieldBase & {
  type: 'enum'
  default?: any
  options: string[]
}

export type NestedTypeField = FieldBase &
  NestedType & {
    default?: any
  }

export const isNestedTypeField = (_: FieldDef): _ is NestedTypeField => _.type === 'nested'

export type ReferenceField = FieldBase &
  DocumentType & {
    default?: string
  }

export type Thunk<T> = () => T

export type NestedType<DefName extends string = string> = {
  type: 'nested'
  def: Thunk<NestedTypeDef<DefName> | UnnamedNestedTypeDef>
}

export type DocumentType<DefName extends string = string> = { type: 'document'; def: Thunk<DocumentTypeDef<DefName>> }

export const defineNestedType = <DefName extends string>(
  def: Thunk<NestedTypeDef<DefName> | UnnamedNestedTypeDef>,
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
