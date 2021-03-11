import { ComputedField, ComputedFieldType } from './computed-field'

export type SchemaDef = {
  // ssg: string
  // cms: string
  documentDefs: DocumentDef[]
}

/** Top level model type */
export type DocumentDef<Name extends string = string> = {
  name: Name
  // type: ModelType
  /**  */
  label: string
  description?: string
  // the name of the field that will be used as a title of an object
  labelField?: string
  fields: FieldDef[] | Thunk<FieldDef[]>
  // TODO file + URL matching
  // computedFields?: ComputedField<any, Name>
  // computedFields?:  <T extends ComputedFieldType>(_: ComputedField<T, Name>) => ComputedField<any, Name>
  computedFields?: (
    defineField: <T extends ComputedFieldType>(cf: ComputedField<T, Name>) => ComputedField<T, Name>,
  ) => ComputedField<ComputedFieldType, Name>[]
  filePathPattern: string // | ((doc: Document) => string)
  /** Conditional extensions */
  // extentions?:
  //   | {
  //       /** just needed for simple SSGs */
  //       kind: 'simple-ssg'
  //       /** E.g. `./src/fetched-content/blog/${doc.slug}.md` */
  //       saveToFilePath: string | ((doc: Document) => string)
  //     }
  //   | {
  //       /** Needed for Next.js */
  //       kind: 'local-source'
  //       /** Supports file globbing */
  //       filePath: string | ((doc: Document) => string)
  //       filter?: (doc: Document) => boolean
  //     }
  // 1) difference between page vs raw data: page has a URL path
  /**
   * Just needed for Next.js & Gatsby, not for simple SSG (e.g. Hugo derives the URL based on the filePath).
   * Also needed for some Stackbit Studio features to work.
   */
  // urlPath?: string | ((doc: Document) => string)
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

export type FieldDef =
  | ListField
  | StringField
  | NumberField
  | BooleanField
  | SlugField
  | DateField
  | MarkdownField
  | TextField
  | UrlField
  | ImageField
  | ObjectField
  | InlineObjectField
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
  items: ListFieldItem[] | Thunk<ListFieldItem[]>
}

export const isListField = (_: FieldDef): _ is ListField => _.type === 'list'

export type ListFieldItem =
  | ListFieldItemString
  | ListFieldItemEnum
  | ListFieldItemBoolean
  | ListFieldItemObject
  | ListFieldItemInlineObject

type BaseListFieldItem = { labelField?: string }

export type ListFieldItemString = BaseListFieldItem & { type: 'string' }
export type ListFieldItemEnum = BaseListFieldItem & { type: 'enum'; options: string[] }
export type ListFieldItemBoolean = BaseListFieldItem & { type: 'boolean' }
export type ListFieldItemObject = BaseListFieldItem & {
  type: 'object'
  object: ObjectDef | Thunk<ObjectDef>
}
export type ListFieldItemInlineObject = BaseListFieldItem & {
  type: 'inline_object'
  fields: FieldDef[] | Thunk<FieldDef[]>
}

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

export type ObjectField = FieldBase & {
  type: 'object'
  default?: any
  object: ObjectDef | Thunk<ObjectDef>
}

export const isObjectField = (_: FieldDef): _ is ObjectField => _.type === 'object'

export type InlineObjectField = FieldBase & {
  type: 'inline_object'
  default?: any
  fields: FieldDef[] | Thunk<FieldDef[]>
}

export const isInlineObjectField = (_: FieldDef): _ is InlineObjectField => _.type === 'inline_object'

export type ReferenceField = FieldBase & {
  type: 'reference'
  default?: string
  document: DocumentDef
}

export type ObjectDef = {
  name: string
  // type: ModelType
  /**  */
  label: string
  description?: string
  labelField?: string
  fields: FieldDef[] | Thunk<FieldDef[]>
}

type Thunk<T> = () => T

export const defineObject = (_: ObjectDef): ObjectDef => _

export const defineDocument = <N extends string>(_: DocumentDef<N>): DocumentDef => _

export const defineSchema = (_: SchemaDef): SchemaDef => _
