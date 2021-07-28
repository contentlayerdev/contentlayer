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
  | ObjectFieldDef
  | InlineObjectFieldDef
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
  of: ListFieldDefItem
}

export const isListFieldDef = (_: FieldDef): _ is ListFieldDef => _.type === 'list'

export interface PolymorphicListFieldDef extends FieldBase {
  type: 'polymorphic_list'
  default: any[] | undefined
  of: ListFieldDefItem[]
  /** Field needed to distiguish list data items at run time */
  typeField: string
}

export type ListFieldDefItem =
  | ListFieldItemString
  | ListFieldItemEnum
  | ListFieldItemBoolean
  | ListFieldItemObject
  | ListFieldItemInlineObject
  | ListFieldItemReference

type BaseListFieldItem = {
  // labelField: string | undefined
}

export type ListFieldItemString = BaseListFieldItem & { type: 'string' }
export type ListFieldItemEnum = BaseListFieldItem & { type: 'enum'; options: string[] }
export type ListFieldItemBoolean = BaseListFieldItem & { type: 'boolean' }
export type ListFieldItemObject = BaseListFieldItem & {
  type: 'object'
  objectName: string
}
export type ListFieldItemInlineObject = BaseListFieldItem & {
  type: 'inline_object'
  fieldDefs: FieldDef[]
}

export type ListFieldItemReference = BaseListFieldItem & {
  type: 'document'
  documentName: string
}

export const isListFieldDefItemObject = (_: ListFieldDefItem): _ is ListFieldItemObject => _.type === 'object'

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

export type ObjectFieldDef = FieldBase & {
  type: 'object'
  default: any | undefined
  /** References entry in ObjectDefMap */
  objectName: string
}

export const isObjectFieldDef = (_: FieldDef): _ is ObjectFieldDef => _.type === 'object'

export type InlineObjectFieldDef = FieldBase & {
  type: 'inline_object'
  default: any | undefined
  fieldDefs: FieldDef[]
}

export const isInlineObjectFieldDef = (_: FieldDef): _ is InlineObjectFieldDef => _.type === 'inline_object'

export type ReferenceFieldDef = FieldBase & {
  type: 'document'
  default: string | undefined
  documentName: string
}
