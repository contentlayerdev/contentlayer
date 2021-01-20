export type Schema = {
  documents: Document[]
}

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

/** Top level model type */
export type Document = {
  name: string
  // type: ModelType
  /**  */
  label: string
  description?: string
  // the name of the field that will be used as a title of an object
  labelField?: string
  fields: Field[]
  // TODO file + URL matching
  folder?: string | (() => string)
  // 1) difference between page vs raw data: page has a URL path
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

export type Field<N extends string = string> =
  | StringField<N>
  | BooleanField<N>
  | SlugField<N>
  | DateField<N>
  | MarkdownField<N>
  | TextField<N>
  | ImageField<N>
  | ObjectField<N>
  | ReferenceField<N>
  | EnumField<N>

type FieldBase<N extends string> = {
  /** Field name should contain only alphanumeric characters, underscore and a hyphen [A-Za-z0-9_]. Must start with a letter. Must not end with an underscore or a hyphen. */
  name: N
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
  // list?: boolean
}

export type StringField<N extends string> = FieldBase<N> & {
  type: 'string'
  default?: string
}

export type BooleanField<N extends string> = FieldBase<N> & {
  type: 'boolean'
  default?: boolean
}

// why is this field type needed?
export type SlugField<N extends string> = FieldBase<N> & {
  type: 'slug'
  default?: string
}

export type DateField<N extends string> = FieldBase<N> & {
  type: 'date'
  default?: string
}

export type MarkdownField<N extends string> = FieldBase<N> & {
  type: 'markdown'
  default?: string
}

// why is this field type needed?
export type TextField<N extends string> = FieldBase<N> & {
  type: 'text'
  default?: string
}

export type ImageField<N extends string> = FieldBase<N> & {
  type: 'image'
  default?: string
}

export type EnumField<N extends string> = FieldBase<N> & {
  type: 'enum'
  default?: any
  options: string[]
}

export type ObjectField<N extends string> =
  | (FieldBase<N> & {
      type: 'object'
      // default?: DataForFields<Object['fields']>
      default?: any
      object: Object
      list?: undefined | false
    })
  | (FieldBase<N> & {
      type: 'object'
      default?: any[]
      object: Object[]
      list: true
    })

export type ReferenceField<N extends string> =
  | (FieldBase<N> & {
      type: 'reference'
      default?: string
      document: string | Document
      list?: false | undefined
    })
  | (FieldBase<N> & {
      type: 'reference'
      default?: string
      document: string[] | Document[]
      list: true
    })

// type DataForFields<FS extends Field[]> = FS extends [Head<infer F>, ...any] ? [DataForField<F>, ] : never
// type DataForFields<FS extends Field[]> = [DataForField<Head<FS>>]
export type DataForFields<FS extends readonly Field[]> = Prettify<
  UnionToIntersection<DataForFields_<FS>[number]>
>
type DataForFields_<FS extends readonly Field[]> = Head<FS> extends Field
  ? Tail<FS> extends infer FS_
    ? FS_ extends Field[]
      ? FS_['length'] extends 0
        ? [DataForField<Head<FS>>]
        : Cons<DataForField<Head<FS>>, DataForFields_<FS_>>
      : never
    : never
  : never

type DataForField<F extends Field> = {
  [P in F['name']]: TypeForField<F['type']>
}

type TypeForField<FT extends Field['type']> = FT extends 'string'
  ? string
  : 'todo'

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never

export const field = <F extends Field>(_: F): F => _

const field1 = field({ type: 'string', name: 'content' as const })
const field2 = field({ type: 'string', name: 'title' as const })

type X = DataForFields<[typeof field1, typeof field2]>

type Head<T extends readonly any[], D = never> = T extends [infer X, ...any[]]
  ? X
  : D
type Tail<T extends readonly any[]> = ((...x: T) => void) extends (
  x: any,
  ...xs: infer XS
) => void
  ? XS
  : never
type Cons<X, XS extends any[]> = ((h: X, ...args: XS) => void) extends (
  ...args: infer R
) => void
  ? R
  : []

// type Object<N extends string, FS extends readonly Field<N>[]> = {
//   name: string
//   // type: ModelType
//   /**  */
//   label: string
//   description?: string
//   labelField?: string
//   fields: FS
// }

type Object = {
  name: string
  // type: ModelType
  /**  */
  label: string
  description?: string
  labelField?: string
  fields: Field[] | (() => Field[])
}

// export const object = <
//   O extends Object<N, readonly Field<N>[]>,
//   N extends string
// >(
//   _: O,
// ): O => _
// export const object = <O extends Object>(_: NoExtraProperties<Object, O>): O =>
//   _
export const object = (_: Object): Object => _

export const document = (_: Document): Document => _

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
export type NoExtraProperties<T, U extends T = T> = U &
  Impossible<Exclude<keyof U, keyof T>>

export type Model = {
  name: string
  // type: ModelType
  /**  */
  label: string
  description?: string
  // the name of the field that will be used as a title of an object
  labelField?: string
  fields: Field[]
  // TODO file + URL matching
  filePath?: string | (() => string)
  // 1) difference between page vs raw data: page has a URL path
  // 2) file path
}

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
