import { GetType } from './data'

export type ComputedFieldType = 'string' | 'number' | 'boolean'

export type ComputedField<
  T extends ComputedFieldType,
  DocName extends string
> = {
  name: string
  description?: string
  type: T
  resolve: ComputedFieldResolver<T, DocName>
}

type ComputedFieldResolver<
  T extends ComputedFieldType,
  DocName extends string
> = (
  _: Omit<GetType<DocName>, '__computed'>,
) => GetReturnType<T> | Promise<GetReturnType<T>>

type GetReturnType<T extends ComputedFieldType> = T extends 'string'
  ? string
  : T extends 'number'
  ? number
  : T extends 'boolean'
  ? boolean
  : never
