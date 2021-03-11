export type FieldDefType = FieldDef['type']

export type FieldDef =
  | ListFieldDef
  | StringFieldDef
  | NumberFieldDef
  | BooleanFieldDef
  | SlugFieldDef
  | DateFieldDef
  | MarkdownFieldDef
  | TextFieldDef
  | ImageFieldDef
  | UrlFieldDef
  | ObjectFieldDef
  | InlineObjectFieldDef
  | ReferenceFieldDef
  | EnumFieldDef

interface FieldBase {
  /** Field name should contain only alphanumeric characters, underscore and a hyphen [A-Za-z0-9_]. Must start with a letter. Must not end with an underscore or a hyphen. */
  name: string
  /** Should be short enough as some CMS's have restrictions on its length. Some CMS require label to be unique. */
  label?: string
  /** Short description to editors how the field is to be used */
  description?: string
  /**
   * Default: false
   */
  required?: boolean
  /** IS THIS NEEDED? */
  const?: any
  /** Users will not be able to edit hidden fields, therefore when hiding a field you should specify the default or const properties to populate these fields when new objects are created. */
  hidden?: boolean
}

export interface ListFieldDef extends FieldBase {
  type: 'list'
  default?: any[]
  // TODO support polymorphic definitions
  items: ListFieldDefItem[]
}

export const isListFieldDef = (_: FieldDef): _ is ListFieldDef => _.type === 'list'

export type ListFieldDefItem =
  | ListFieldItemString
  | ListFieldItemEnum
  | ListFieldItemBoolean
  | ListFieldItemObject
  | ListFieldItemInlineObject
  | ListFieldItemReference

type BaseListFieldItem = { labelField?: string }

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
  type: 'reference'
  documentName: string
}

export const isListFieldDefItemObject = (_: ListFieldDefItem): _ is ListFieldItemObject => _.type === 'object'

export type StringFieldDef = FieldBase & {
  type: 'string'
  default?: string
}

export type NumberFieldDef = FieldBase & {
  type: 'number'
  default?: number
}

export type BooleanFieldDef = FieldBase & {
  type: 'boolean'
  default?: boolean
}

// why is this field type needed?
export type SlugFieldDef = FieldBase & {
  type: 'slug'
  default?: string
}

export type DateFieldDef = FieldBase & {
  type: 'date'
  default?: string
}

export type MarkdownFieldDef = FieldBase & {
  type: 'markdown'
  default?: string
}

// why is this field type needed?
export type TextFieldDef = FieldBase & {
  type: 'text'
  default?: string
}

export type ImageFieldDef = FieldBase & {
  type: 'image'
  default?: string
}

export type UrlFieldDef = FieldBase & {
  type: 'url'
  default?: string
}

export type EnumFieldDef = FieldBase & {
  type: 'enum'
  default?: string
  options: string[]
}

export type ObjectFieldDef = FieldBase & {
  type: 'object'
  default?: any
  /** References entry in ObjectDefMap */
  objectName: string
}

export const isObjectFieldDef = (_: FieldDef): _ is ObjectFieldDef => _.type === 'object'

export type InlineObjectFieldDef = FieldBase & {
  type: 'inline_object'
  default?: any
  fieldDefs: FieldDef[]
}

export const isInlineObjectFieldDef = (_: FieldDef): _ is InlineObjectFieldDef => _.type === 'inline_object'

export type ReferenceFieldDef = FieldBase & {
  type: 'reference'
  default?: string
  documentName: string
}
