export type SchemaDef = {
  documents: DocumentDef[]
}

/** Top level model type */
export type DocumentDef = {
  name: string
  // type: ModelType
  /**  */
  label: string
  description?: string
  // the name of the field that will be used as a title of an object
  labelField?: string
  fields: Field[] | Thunk<Field[]>
  // TODO file + URL matching
  folder?: string | Thunk<string>
  // 1) difference between page vs raw data: page has a URL path
  // 2) file path
}

export type FieldType =
  | 'string'
  | 'text'
  | 'slug'
  /** Reference to owned object, (= "inline model") */
  | 'object'
  // /** Reference to owned model */
  // | 'model'
  /** Reference to document */
  | 'reference'

export type Field =
  | ListField
  | StringField
  | BooleanField
  | SlugField
  | DateField
  | MarkdownField
  | TextField
  | ImageField
  | ObjectField
  | ReferenceField
  | EnumField

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

export interface ListField extends FieldBase {
  type: 'list'
  default?: any[]
  items: ListFieldItems
}

type ListFieldItems =
  | ListFieldItemsString
  | ListFieldItemsBoolean
  | ListFieldItemsObject

type BaseListFieldItems = { labelField?: string }

type ListFieldItemsString = BaseListFieldItems & { type: 'string' }
type ListFieldItemsBoolean = BaseListFieldItems & { type: 'boolean' }
type ListFieldItemsObject = BaseListFieldItems & {
  type: 'object'
  object:
    | string
    | ObjectDef
    | Thunk<ObjectDef>
    | string[]
    | ObjectDef[]
    | Thunk<ObjectDef[]>
}

export type StringField = FieldBase & {
  type: 'string'
  default?: string
}

export type BooleanField = FieldBase & {
  type: 'boolean'
  default?: boolean
}

// why is this field type needed?
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

// why is this field type needed?
export type TextField = FieldBase & {
  type: 'text'
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

export type ObjectField = FieldBase & {
  type: 'object'
  // default?: DataForFields<Object['fields']>
  default?: any
  object: string | ObjectDef | Thunk<ObjectDef>
}

export type ReferenceField = FieldBase & {
  type: 'reference'
  default?: string
  document: string | DocumentDef
}

type ObjectDef = {
  name: string
  // type: ModelType
  /**  */
  label: string
  description?: string
  labelField?: string
  fields: Field[] | Thunk<Field[]>
}

type Thunk<T> = () => T

export const defineObject = (_: ObjectDef): ObjectDef => _

export const defineDocument = (_: DocumentDef): DocumentDef => _

export const defineSchema = (_: SchemaDef): SchemaDef => _
