import type { StackbitExtension } from '@contentlayer/core'

import type { ComputedField } from './computed-field'

export type SchemaDef = {
  documentDefs: DocumentDef[]
}

export type DocumentFileType = 'markdown' | 'mdx' | 'json' | 'yaml'

export type ModelExtensions<DefName extends string = string> = {
  stackbit?: StackbitExtension.ModelExtension<DefName>
}

export type FieldDefs = Record<string, FieldDef> | FieldDefWithName[]

/** Top level model type */
export type DocumentDef<DefName extends string = string> = {
  name: DefName
  // type: ModelType
  description?: string

  /**
   * The field definitions can either be provided as an object with the field names as keys or
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

  extensions?: ModelExtensions<DefName>
}

export type ObjectDef<DefName extends string = string> = {
  name: DefName
  // type: ModelType
  /**  */
  description?: string
  fields: FieldDefs
  extensions?: ModelExtensions<DefName>
}

// export type FieldType =
//   | 'string'
//   | 'text'
//   | 'slug'
//   /** Reference to owned object, (= "inline model") */
//   | 'object'
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
  | ObjectField
  | InlineObjectField
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
  type: 'polymorphic_list'
  default?: any[]
  of: ListFieldItem[]
  /** Field needed to distiguish list data items at run time */
  typeField: string
}

export const isListField = (_: FieldDef): _ is ListField => _.type === 'list'

export type ListFieldItem =
  | ListFieldItemString
  | ListFieldItemEnum
  | ListFieldItemBoolean
  | ListFieldItemObject
  | ListFieldItemInlineObject
  | ListFieldItemReference

export type ListFieldItemString = { type: 'string' }
export type ListFieldItemEnum = { type: 'enum'; options: string[] }
export type ListFieldItemBoolean = { type: 'boolean' }
export type ListFieldItemObject = ObjectModel
export type ListFieldItemInlineObject = {
  type: 'inline_object'
  fields: FieldDefs
}
export type ListFieldItemReference = DocumentModel

export const isListFieldItemObject = (_: ListFieldItem): _ is ListFieldItemObject => _.type === 'object'

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

export type ObjectField = FieldBase &
  ObjectModel & {
    default?: any
  }

export const isObjectField = (_: FieldDef): _ is ObjectField => _.type === 'object'

export type InlineObjectField = FieldBase & {
  type: 'inline_object'
  default?: any
  fields: Record<string, FieldDef>
}

export const isInlineObjectField = (_: FieldDef): _ is InlineObjectField => _.type === 'inline_object'

export type ReferenceField = FieldBase &
  DocumentModel & {
    default?: string
  }

export type Thunk<T> = () => T

export type ObjectModel<DefName extends string = string> = { type: 'object'; def: Thunk<ObjectDef<DefName>> }
export type DocumentModel<DefName extends string = string> = { type: 'document'; def: Thunk<DocumentDef<DefName>> }

export const defineObject = <DefName extends string>(def: () => ObjectDef<DefName>): ObjectModel<DefName> => ({
  type: 'object',
  def,
})

export const defineDocument = <DefName extends string>(def: () => DocumentDef<DefName>): DocumentModel<DefName> => ({
  type: 'document',
  def,
})

// export const defineSchema = (_: SchemaDef): SchemaDef => _
