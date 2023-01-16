import type * as core from '@contentlayer/core'
import type { Thunk } from '@contentlayer/utils'

import type { ComputedField } from './computed-field.js'
import type { FieldDef, FieldDefWithName } from './field.js'

export * from './field.js'

export type SchemaDef = {
  documentTypeDefs: DocumentTypeDef[]
}

export type DocumentContentType = 'markdown' | 'mdx' | 'data'

export type TypeExtensions<DefName extends string = string> = {
  stackbit?: core.StackbitExtension.TypeExtension<DefName>
}

export type FieldDefs = Record<string, FieldDef> | FieldDefWithName[]

export type DocumentTypeDef<DefName extends string = string> = {
  name: DefName
  description?: string

  /**
   * The field definitions can either be provided as an object with the field names as keys or
   * as an array of all field definitions including the name as an extra field. (The array definition
   * can be used if you want more control over the order of the fields.)
   *
   * @default []
   */
  fields?: FieldDefs

  computedFields?: ComputedFields<DefName>

  /** Path is relative to the `contentDirPath` config */
  filePathPattern?: string // | ((doc: Document) => string)

  /**
   * Default is `markdown`
   *
   * Choose `data` e.g. for a `.json` or `.yaml` file
   */
  contentType?: DocumentContentType

  isSingleton?: boolean

  extensions?: TypeExtensions<DefName>
}

export type ComputedFields<DefName extends string = string> = Record<string, ComputedField<DefName>>

export type NestedTypeDef<DefName extends string = string> = {
  // type: 'NestedTypeDef'
  name: DefName
  description?: string
  /** @default [] */
  fields?: FieldDefs
  extensions?: TypeExtensions<DefName>
}

export const isNestedTypeDef = (_: NestedTypeDef | NestedUnnamedTypeDef): _ is NestedTypeDef => _.hasOwnProperty('name')

export type NestedUnnamedTypeDef = {
  // type: 'NestedUnnamedTypeDef'
  /** @default [] */
  fields?: FieldDefs
  extensions?: TypeExtensions
}

export const isNestedUnnamedTypeDef = (_: NestedTypeDef | NestedUnnamedTypeDef): _ is NestedUnnamedTypeDef =>
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

export type NestedType<DefName extends string = string> = {
  type: 'nested'
  def: Thunk<NestedTypeDef<DefName> | NestedUnnamedTypeDef>
}

export type DocumentType<DefName extends string = string> = { type: 'document'; def: Thunk<DocumentTypeDef<DefName>> }

// `<any>` cast here is needed here to flip variance (see https://github.com/contentlayerdev/contentlayer/issues/33)
export type DocumentTypes = DocumentType<any>[] | Record<string, DocumentType<any>>

export const defineNestedType = <DefName extends string>(
  def: Thunk<NestedTypeDef<DefName> | NestedUnnamedTypeDef>,
  // NOTE we're not using the generic `DefName` here because it causes problems with when using the defined document type
): NestedType => ({
  type: 'nested',
  def,
})

export const defineDocumentType = <DefName extends string>(
  def: Thunk<DocumentTypeDef<DefName>>,
  // NOTE we're not using the generic `DefName` here because it causes problems with when using the defined document type
): DocumentType => ({
  type: 'document',
  def,
})

export const defineFields = <TFieldDefs extends FieldDefs>(fields: TFieldDefs): TFieldDefs => fields

export const defineComputedFields = <
  TDefName extends string,
  TComputedFields extends ComputedFields<TDefName> = ComputedFields<TDefName>,
>(
  computedFields: TComputedFields,
): TComputedFields => computedFields
