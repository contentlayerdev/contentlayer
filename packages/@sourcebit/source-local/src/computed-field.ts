import { GetDocumentTypeGen } from '@sourcebit/core'

export type ComputedFieldType = 'string' | 'number' | 'boolean'

export type ComputedField<FieldType extends ComputedFieldType, DocumentTypeName extends string> = {
  name: string
  description?: string
  type: FieldType
  resolve: ComputedFieldResolver<FieldType, DocumentTypeName>
}

// TODO come up with a way to hide computed fields from passed in document
type ComputedFieldResolver<FieldType extends ComputedFieldType, DocumentTypeName extends string> = (
  _: GetDocumentTypeGen<DocumentTypeName>,
) => GetReturnType<FieldType> | Promise<GetReturnType<FieldType>>

type GetReturnType<T extends ComputedFieldType> = T extends 'string'
  ? string
  : T extends 'number'
  ? number
  : T extends 'boolean'
  ? boolean
  : never
