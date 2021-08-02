import type { GetDocumentTypeGen } from '@contentlayer/core'

import type { FieldDefType } from '.'

export type ComputedField<DocumentTypeName extends string = string> = {
  description?: string
  type: FieldDefType
  resolve: ComputedFieldResolver<DocumentTypeName>
}

// TODO come up with a way to hide computed fields from passed in document
type ComputedFieldResolver<DocumentTypeName extends string> = (
  _: GetDocumentTypeGen<DocumentTypeName>,
) => any | Promise<any>
