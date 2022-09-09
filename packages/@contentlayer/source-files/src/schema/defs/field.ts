import type { DocumentType, NestedType } from './index.js'

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
  | DateFieldDef
  | MarkdownFieldDef
  | MDXFieldDef
  | ImageFieldDef
  | EnumFieldDef
  | NestedFieldDef
  | NestedPolymorphicFieldDef
  | ReferenceFieldDef
  | ReferencePolymorphicFieldDef

/**
 * Field name should contain only alphanumeric characters, underscore and a hyphen [A-Za-z0-9_].
 * Must start with a letter. Must not end with an underscore or a hyphen.
 */
interface FieldDefBase {
  /** Short description to editors how the field is to be used */
  description?: string

  /**
   * Whether the field is required or not. Fields are optional by default.
   * @default false
   */
  required?: boolean
}

// type WithComputedField<ValueType,> = {
//   computed:
// }

export interface ListFieldDef extends FieldDefBase {
  type: 'list'
  default?: readonly any[]
  of: ListFieldDefItem.Item
}

export interface ListPolymorphicFieldDef extends FieldDefBase {
  type: 'list'
  default?: readonly any[]
  of: readonly ListFieldDefItem.Item[]

  /**
   * Field needed to distiguish list data items at run time. Defaults to `fieldOptions.typeFieldName`
   * This option is only needed when using non-scalar `of` values (e.g. `nested`)
   */
  typeField?: string
}

export const isListFieldDef = (_: FieldDef): _ is ListFieldDef => _.type === 'list' && !Array.isArray(_.of)
export const isListPolymorphicFieldDef = (_: FieldDef): _ is ListPolymorphicFieldDef =>
  _.type === 'list' && Array.isArray(_.of)

export namespace ListFieldDefItem {
  export type Item =
    | ItemString
    | ItemNumber
    | ItemBoolean
    | ItemJSON
    | ItemDate
    | ItemMarkdown
    | ItemMDX
    | ItemImage
    | ItemEnum
    | ItemNestedType
    | ItemDocumentReference

  export type ItemString = { type: 'string' }
  export type ItemNumber = { type: 'number' }
  export type ItemBoolean = { type: 'boolean' }
  export type ItemJSON = { type: 'json' }
  export type ItemDate = { type: 'date' }
  export type ItemMarkdown = { type: 'markdown' }
  export type ItemMDX = { type: 'mdx' }
  export type ItemImage = { type: 'image' }
  export type ItemEnum = { type: 'enum'; options: readonly string[] }
  export type ItemNestedType = NestedType
  export type ItemDocumentReference = DocumentType & {
    /**
     * Whether Contentlayer should embed the referenced document instead of the reference value (i.e. file path)
     *
     * @experimental
     * @default false
     */
    embedDocument?: boolean
  }

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

export type ImageFieldDef = FieldDefBase & {
  type: 'image'
  default?: string
}

export type EnumFieldDef = FieldDefBase & {
  type: 'enum'
  default?: any
  options: readonly string[]
}

export type NestedFieldDef = FieldDefBase & {
  type: 'nested'
  of: NestedType
  default?: any
}

export const isNestedFieldDef = (_: FieldDef): _ is NestedFieldDef => _.type === 'nested' && !Array.isArray(_.of)

export type NestedPolymorphicFieldDef = FieldDefBase & {
  type: 'nested'
  of: readonly NestedType[]

  /**
   * Field needed to distiguish list data items at run time. Defaults to `fieldOptions.typeFieldName`
   * This option is only needed when using non-scalar `of` values (e.g. `nested`)
   */
  typeField?: string
  default?: any
}

export const isNestedPolymorphicFieldDef = (_: FieldDef): _ is NestedPolymorphicFieldDef =>
  _.type === 'nested' && Array.isArray(_.of)

/** Referenced documents are expected to be relative to `contentDirPath` */
export type ReferenceFieldDef = FieldDefBase & {
  type: 'reference'
  default?: string
  of: DocumentType

  /**
   * Whether Contentlayer should embed the referenced document instead of the reference value (i.e. file path)
   *
   * @experimental
   * @default false
   */
  embedDocument?: boolean
}

export type ReferencePolymorphicFieldDef = FieldDefBase & {
  type: 'reference'
  default?: string
  of: readonly DocumentType[]

  /**
   * Field needed to distiguish list data items at run time. Defaults to `fieldOptions.typeFieldName`
   * This option is only needed when using non-scalar `of` values (e.g. `nested`)
   */
  typeField?: string
}

export const isReferencePolymorphicFieldDef = (_: FieldDef): _ is ReferencePolymorphicFieldDef =>
  _.type === 'reference' && Array.isArray(_.of)
