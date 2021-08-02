import type { DocumentType, NestedType } from '.'

export type FieldDefType = FieldDef['type']

/** Needed for the record-style field definitions */
export type FieldDefWithName = FieldDef & { name: string }

export type FieldDef =
  | ListFieldDef
  | ListPolymorphicFieldDef
  | StringFieldDef
  | NumberFieldDef
  | BooleanFieldDef
  | JSONFieldDef
  // | SlugFieldDef
  | DateFieldDef
  | MarkdownFieldDef
  | MDXFieldDef
  // | TextFieldDef
  // | UrlFieldDef
  // | ImageFieldDef
  | EnumFieldDef
  | NestedFieldDef
  | NestedPolymorphicFieldDef
  | ReferenceFieldDef
  | ReferencePolymorphicFieldDef

/** Field name should contain only alphanumeric characters, underscore and a hyphen [A-Za-z0-9_]. Must start with a letter. Must not end with an underscore or a hyphen. */
interface FieldDefBase {
  /** Short description to editors how the field is to be used */
  description?: string
  /**
   * Whether the field is required or not. Fields are optional by default.
   * @default false
   */
  required?: boolean
}

export interface ListFieldDef extends FieldDefBase {
  type: 'list'
  default?: any[]
  of: ListFieldDefItem.Item
}

export interface ListPolymorphicFieldDef extends FieldDefBase {
  type: 'list'
  default?: any[]
  of: ListFieldDefItem.Item[]
  /** Field needed to distiguish list data items at run time */
  typeField: string
}

export const isListFieldDef = (_: FieldDef): _ is ListFieldDef => _.type === 'list' && !Array.isArray(_.of)
export const isListPolymorphicFieldDef = (_: FieldDef): _ is ListPolymorphicFieldDef =>
  _.type === 'list' && Array.isArray(_.of)

export namespace ListFieldDefItem {
  export type Item = ItemString | ItemEnum | ItemBoolean | ItemNestedType | ItemDocumentReference

  export type ItemString = { type: 'string' }
  export type ItemEnum = { type: 'enum'; options: string[] }
  export type ItemBoolean = { type: 'boolean' }
  export type ItemNestedType = NestedType
  export type ItemDocumentReference = DocumentType

  export const isDefItemNested = (_: Item): _ is ItemNestedType => _.type === 'nested'
}

export type StringFieldDef = FieldDefBase & {
  type: 'string'
  default?: string
}

export type NumberFieldDef = FieldDefBase & {
  type: 'number'
  default?: number
}

export type BooleanFieldDef = FieldDefBase & {
  type: 'boolean'
  default?: boolean
}

export type JSONFieldDef = FieldDefBase & {
  type: 'json'
  default?: any
}

// TODO why is this field type needed?
// export type SlugFieldDef = FieldDefBase & {
//   type: 'slug'
//   default?: string
// }

export type DateFieldDef = FieldDefBase & {
  type: 'date'
  default?: string
}

export type MarkdownFieldDef = FieldDefBase & {
  type: 'markdown'
  default?: string
}

export type MDXFieldDef = FieldDefBase & {
  type: 'mdx'
  default?: string
}

// // why is this field type needed?
// export type TextFieldDef = FieldDefBase & {
//   type: 'text'
//   default?: string
// }

// export type UrlFieldDef = FieldDefBase & {
//   type: 'url'
//   default?: string
// }

// export type ImageFieldDef = FieldDefBase & {
//   type: 'image'
//   default?: string
// }

export type EnumFieldDef = FieldDefBase & {
  type: 'enum'
  default?: any
  options: string[]
}

export type NestedFieldDef = FieldDefBase & {
  type: 'nested'
  of: NestedType
  default?: any
}

export const isNestedFieldDef = (_: FieldDef): _ is NestedFieldDef => _.type === 'nested' && !Array.isArray(_.of)

export type NestedPolymorphicFieldDef = FieldDefBase & {
  type: 'nested'
  of: NestedType[]
  /** Field needed to distinguish list data items at run time */
  typeField: string
  default?: any
}

export const isNestedPolymorphicFieldDef = (_: FieldDef): _ is NestedPolymorphicFieldDef =>
  _.type === 'nested' && Array.isArray(_.of)

export type ReferenceFieldDef = FieldDefBase & {
  type: 'reference'
  default?: string
  of: DocumentType
}

export type ReferencePolymorphicFieldDef = FieldDefBase & {
  type: 'reference'
  default?: string
  of: DocumentType[]
  /** Field needed to distinguish list data items at run time */
  typeField: string
}

export const isReferencePolymorphicFieldDef = (_: FieldDef): _ is ReferencePolymorphicFieldDef =>
  _.type === 'reference' && Array.isArray(_.of)
