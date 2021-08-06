import type { NestedUnnamedTypeDef } from '.'

export type FieldDefType = FieldDef['type']

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
  // | ImageFieldDef
  // | UrlFieldDef
  | EnumFieldDef
  | NestedFieldDef
  | NestedPolymorphicFieldDef
  | NestedUnnamedFieldDef
  | ReferenceFieldDef
  | ReferencePolymorphicFieldDef

export interface FieldDefBase {
  /** Field name should contain only alphanumeric characters, underscore and a hyphen [A-Za-z0-9_]. Must start with a letter. Must not end with an underscore or a hyphen. */
  name: string
  // /** Should be short enough as some CMS's have restrictions on its length. Some CMS require label to be unique. */
  // label: string | undefined
  /** Short description to editors how the field is to be used */
  description: string | undefined
  /**
   * Default: false
   */
  isRequired: boolean

  isSystemField: boolean
}

export interface ListFieldDef extends FieldDefBase {
  type: 'list'
  default: any[] | undefined
  // TODO support polymorphic definitions
  of: ListFieldDefItem.Item
}

export const isListFieldDef = (_: FieldDef): _ is ListFieldDef => _.type === 'list'

export interface ListPolymorphicFieldDef extends FieldDefBase {
  type: 'list_polymorphic'
  default: any[] | undefined
  of: ListFieldDefItem.Item[]
  /** Field needed to distinguish list data items at run time */
  typeField: string
}

export namespace ListFieldDefItem {
  export type Item = ItemString | ItemEnum | ItemBoolean | ItemNested | ItemNestedUnnamed | ItemReference

  type BaseItem = {
    // labelField: string | undefined
  }

  export type ItemString = BaseItem & { type: 'string' }
  export type ItemEnum = BaseItem & { type: 'enum'; options: string[] }
  export type ItemBoolean = BaseItem & { type: 'boolean' }
  export type ItemNested = BaseItem & {
    type: 'nested'
    nestedTypeName: string
  }
  export type ItemNestedUnnamed = BaseItem & {
    type: 'nested_unnamed'
    typeDef: NestedUnnamedTypeDef
  }

  export type ItemReference = BaseItem & {
    type: 'reference'
    documentTypeName: string
  }

  export const isDefItemNested = (_: Item): _ is ItemNested => _.type === 'nested'
}

export type StringFieldDef = FieldDefBase & {
  type: 'string'
  default: string | undefined
}

export type NumberFieldDef = FieldDefBase & {
  type: 'number'
  default: number | undefined
}

export type BooleanFieldDef = FieldDefBase & {
  type: 'boolean'
  default: boolean | undefined
}

export type JSONFieldDef = FieldDefBase & {
  type: 'json'
  default: any | undefined
}

// TODO why is this field type needed?
export type SlugFieldDef = FieldDefBase & {
  type: 'slug'
  default: string | undefined
}

export type DateFieldDef = FieldDefBase & {
  type: 'date'
  default: string | undefined
}

export type MarkdownFieldDef = FieldDefBase & {
  type: 'markdown'
  default: string | undefined
}

export type MDXFieldDef = FieldDefBase & {
  type: 'mdx'
  default: string | undefined
}

// why is this field type needed?
export type TextFieldDef = FieldDefBase & {
  type: 'text'
  default: string | undefined
}

export type ImageFieldDef = FieldDefBase & {
  type: 'image'
  default: string | undefined
}

export type UrlFieldDef = FieldDefBase & {
  type: 'url'
  default: string | undefined
}

export type EnumFieldDef = FieldDefBase & {
  type: 'enum'
  default: string | undefined
  options: string[]
}

export type NestedFieldDef = FieldDefBase & {
  type: 'nested'
  default: any | undefined
  /** References entry in NestedDefMap */
  nestedTypeName: string
}

export const isNestedFieldDef = (_: FieldDef): _ is NestedFieldDef => _.type === 'nested'

export type NestedPolymorphicFieldDef = FieldDefBase & {
  type: 'nested_polymorphic'
  default: any | undefined
  /** References entries in NestedDefMap */
  nestedTypeNames: string[]
  /** Field needed to distinguish list data items at run time */
  typeField: string
}

export const isNestedPolymorphicFieldDef = (_: FieldDef): _ is NestedPolymorphicFieldDef =>
  _.type === 'nested_polymorphic'

export type NestedUnnamedFieldDef = FieldDefBase & {
  type: 'nested_unnamed'
  default: any | undefined
  typeDef: NestedUnnamedTypeDef
}

export const isNestedUnnamedFieldDef = (_: FieldDef): _ is NestedUnnamedFieldDef => _.type === 'nested_unnamed'

export type ReferenceFieldDef = FieldDefBase & {
  type: 'reference'
  default: string | undefined
  documentTypeName: string
}

export type ReferencePolymorphicFieldDef = FieldDefBase & {
  type: 'reference_polymorphic'
  default: string | undefined
  documentTypeNames: string[]
  /** Field needed to distinguish list data items at run time */
  typeField: string
}
