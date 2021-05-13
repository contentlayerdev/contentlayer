import { GetDocumentTypeGen } from '@contentlayer/core'
import { FieldDefType } from './schema'

export type ComputedField<DocumentTypeName extends string> = {
  description?: string
  type: FieldDefType
  resolve: ComputedFieldResolver<DocumentTypeName>
}

// TODO come up with a way to hide computed fields from passed in document
type ComputedFieldResolver<DocumentTypeName extends string> = (
  _: GetDocumentTypeGen<DocumentTypeName>,
) => any | Promise<any>
