/**
schema extension for file-based SSGs
pageModels: [
  {
    name: 'page',
    urlPath: '...',
    filePath: '...'
  }
]
*/

// type DataForFields<FS extends Field[]> = FS extends [Head<infer F>, ...any] ? [DataForField<F>, ] : never
// type DataForFields<FS extends Field[]> = [DataForField<Head<FS>>]
// export type DataForFields<FS extends readonly Field[]> = Prettify<
//   UnionToIntersection<DataForFields_<FS>[number]>
// >
// type DataForFields_<FS extends readonly Field[]> = Head<FS> extends Field
//   ? Tail<FS> extends infer FS_
//     ? FS_ extends Field[]
//       ? FS_['length'] extends 0
//         ? [DataForField<Head<FS>>]
//         : Cons<DataForField<Head<FS>>, DataForFields_<FS_>>
//       : never
//     : never
//   : never

// type DataForField<F extends Field> = {
//   [P in F['name']]: TypeForField<F['type']>
// }

// type TypeForField<FT extends Field['type']> = FT extends 'string'
//   ? string
//   : 'todo'

// type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
//   k: infer I,
// ) => void
//   ? I
//   : never

// export const field = <F extends Field>(_: F): F => _

// const field1 = field({ type: 'string', name: 'content' as const })
// const field2 = field({ type: 'string', name: 'title' as const })

// type X = DataForFields<[typeof field1, typeof field2]>

// type Head<T extends readonly any[], D = never> = T extends [infer X, ...any[]]
//   ? X
//   : D
// type Tail<T extends readonly any[]> = ((...x: T) => void) extends (
//   x: any,
//   ...xs: infer XS
// ) => void
//   ? XS
//   : never
// type Cons<X, XS extends any[]> = ((h: X, ...args: XS) => void) extends (
//   ...args: infer R
// ) => void
//   ? R
//   : []

// type Object<N extends string, FS extends readonly Field<N>[]> = {
//   name: string
//   // type: ModelType
//   /**  */
//   label: string
//   description?: string
//   labelField?: string
//   fields: FS
// }

// export const object = <
//   O extends Object<N, readonly Field<N>[]>,
//   N extends string
// >(
//   _: O,
// ): O => _
// export const object = <O extends Object>(_: NoExtraProperties<Object, O>): O =>
//   _

export type Prettify<T> = T extends infer U
  ? { [K in keyof U]: Prettify<U[K]> }
  : never

export type Impossible<K extends keyof any> = {
  [P in K]: never
}

// The secret sauce! Provide it the type that contains only the properties you want,
// and then a type that extends that type, based on what the caller provided
// using generics.
// From: https://stackoverflow.com/a/57117594/2418739
// export type NoExtraProperties<T, U extends T = T> = U &
//   Impossible<Exclude<keyof U, keyof T>>

// export type Model = {
//   name: string
//   // type: ModelType
//   /**  */
//   label: string
//   description?: string
//   // the name of the field that will be used as a title of an object
//   labelField?: string
//   fields: Field[]
//   // TODO file + URL matching
//   filePath?: string | Thunk<string>
//   // 1) difference between page vs raw data: page has a URL path
//   // 2) file path
// }

//

// const buttonModel: Model = {
//   name: 'link',
//   label: 'Generic link',
//   labelField: 'label',
//   fields: [
//     {
//       name: 'url',
//       type: 'string',
//     },
//     {
//       name: 'label',
//       type: 'string',
//     },
//   ],
// }

// const page: Document = {
//   name: 'post',
//   fields: [
//     {
//       name: 'author link',
//       type: 'object',
//       object: {
//         labelField: buttonModel.labelField,
//         fields: buttonModel.fields,
//       },
//       // models: [ButtonModel, LinkModel]
//     },
//   ],
// }
