import type { UnnamedNestedTypeDef } from '.'

export type FieldDefType = FieldDef['type']

export type FieldDef =
  | ListFieldDef
  | PolymorphicListFieldDef
  | StringFieldDef
  | NumberFieldDef
  | BooleanFieldDef
  | JSONFieldDef
  | SlugFieldDef
  | DateFieldDef
  | MarkdownFieldDef
  | MDXFieldDef
  | TextFieldDef
  | ImageFieldDef
  | UrlFieldDef
  | NestedFieldDef
  | UnnamedNestedFieldDef
  | ReferenceFieldDef
  | EnumFieldDef

export interface FieldBase {
  /** Field name should contain only alphanumeric characters, underscore and a hyphen [A-Za-z0-9_]. Must start with a letter. Must not end with an underscore or a hyphen. */
  name: string
  // /** Should be short enough as some CMS's have restrictions on its length. Some CMS require label to be unique. */
  // label: string | undefined
  /** Short description to editors how the field is to be used */
  description: string | undefined
  /**
   * Default: false
   */
  required: boolean | undefined
}

export interface ListFieldDef extends FieldBase {
  type: 'list'
  default: any[] | undefined
  // TODO support polymorphic definitions
  of: ListFieldDefItem.Item
}

export const isListFieldDef = (_: FieldDef): _ is ListFieldDef => _.type === 'list'

export interface PolymorphicListFieldDef extends FieldBase {
  type: 'polymorphic_list'
  default: any[] | undefined
  of: ListFieldDefItem.Item[]
  /** Field needed to distiguish list data items at run time */
  typeField: string
}

export namespace ListFieldDefItem {
  export type Item = ItemString | ItemEnum | ItemBoolean | ItemNested | ItemUnamedNested | ItemReference

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
  export type ItemUnamedNested = BaseItem & {
    type: 'unnamed_nested'
    typeDef: UnnamedNestedTypeDef
  }

  export type ItemReference = BaseItem & {
    type: 'document'
    documentName: string
  }

  export const isDefItemNested = (_: Item): _ is ItemNested => _.type === 'nested'
}

export type StringFieldDef = FieldBase & {
  type: 'string'
  default: string | undefined
}

export type NumberFieldDef = FieldBase & {
  type: 'number'
  default: number | undefined
}

export type BooleanFieldDef = FieldBase & {
  type: 'boolean'
  default: boolean | undefined
}

export type JSONFieldDef = FieldBase & {
  type: 'json'
  default: any | undefined
}

// TODO why is this field type needed?
export type SlugFieldDef = FieldBase & {
  type: 'slug'
  default: string | undefined
}

export type DateFieldDef = FieldBase & {
  type: 'date'
  default: string | undefined
}

export type MarkdownFieldDef = FieldBase & {
  type: 'markdown'
  default: string | undefined
}

export type MDXFieldDef = FieldBase & {
  type: 'mdx'
  default: string | undefined
}

// why is this field type needed?
export type TextFieldDef = FieldBase & {
  type: 'text'
  default: string | undefined
}

export type ImageFieldDef = FieldBase & {
  type: 'image'
  default: string | undefined
}

export type UrlFieldDef = FieldBase & {
  type: 'url'
  default: string | undefined
}

export type EnumFieldDef = FieldBase & {
  type: 'enum'
  default: string | undefined
  options: string[]
}

export type NestedFieldDef = FieldBase & {
  type: 'nested'
  default: any | undefined
  /** References entry in NestedDefMap */
  nestedTypeName: string
}

export const isNestedFieldDef = (_: FieldDef): _ is NestedFieldDef => _.type === 'nested'

export type UnnamedNestedFieldDef = FieldBase & {
  type: 'unnamed_nested'
  default: any | undefined
  typeDef: UnnamedNestedTypeDef
}

export const isUnamedNestedFieldDef = (_: FieldDef): _ is UnnamedNestedFieldDef => _.type === 'unnamed_nested'

export type ReferenceFieldDef = FieldBase & {
  type: 'document'
  default: string | undefined
  documentTypeName: string
}
