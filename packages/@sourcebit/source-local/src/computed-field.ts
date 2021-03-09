import { GetDocumentTypeGen } from '@sourcebit/core'

export type ComputedFieldType = 'string' | 'number' | 'boolean'

export type ComputedField<FieldType extends ComputedFieldType, DocumentTypeName extends string> = {
  name: string
  description?: string
  type: FieldType
  resolve: ComputedFieldResolver<FieldType, DocumentTypeName>
}

type ComputedFieldResolver<FieldType extends ComputedFieldType, DocumentTypeName extends string> = (
  _: Omit<GetDocumentTypeGen<DocumentTypeName>, '__computed'>,
) => GetReturnType<FieldType> | Promise<GetReturnType<FieldType>>

type GetReturnType<T extends ComputedFieldType> = T extends 'string'
  ? string
  : T extends 'number'
  ? number
  : T extends 'boolean'
  ? boolean
  : never
