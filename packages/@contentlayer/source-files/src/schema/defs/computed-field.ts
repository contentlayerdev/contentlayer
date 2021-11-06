import type { GetDocumentTypeMapGen } from '@contentlayer/core'

import type { LocalDocument } from '../../types.js'
import type { FieldDefType } from './index.js'

export type ComputedField<DocumentTypeName extends string = string> = {
  description?: string
  type: FieldDefType
  resolve: ComputedFieldResolver<DocumentTypeName>
}

// TODO come up with a way to hide computed fields from passed in document
type ComputedFieldResolver<DocumentTypeName extends string> = (
  _: GetDocumentTypeGen<DocumentTypeName>,
) => any | Promise<any>

type GetDocumentTypeGen<Name extends string> = Name extends keyof GetDocumentTypeMapGen<LocalDocument>
  ? GetDocumentTypeMapGen<LocalDocument>[Name]
  : LocalDocument

// type GetDocumentTypeGen<Name extends string> = GetDocumentTypeMapGen<LocalDocument>[Name]
