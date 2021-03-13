import { GetDocumentTypeMapGen, GetDocumentTypeNamesGen } from '@sourcebit/core'

// type Guards = {
//   isType: TypeGuards
//   hasAllFields: typeof hasAllFields
//   allFields: typeof allFields
//   hasField: typeof hasField
// }

// type TypeGuards = { [K in keyof GetDocumentTypeMapGen]: (_: any) => _ is GetDocumentTypeMapGen[K] }

// const isType: TypeGuards = new Proxy(
//   {},
//   {
//     get: (_target, prop) => {
//       return (_: any) => _?.__meta?.typeName === prop
//     },
//   },
// )

// const is_ = <P extends GetTypeNamesGen | GetTypeNamesGen[]>(_: any, typeName: P): P extends any[] ? _ is GetTypeMapGen[P] : _ is any => {
type TypeNameOneOrMany = GetDocumentTypeNamesGen | GetDocumentTypeNamesGen[]
type TypeForTypeNameOneOrMany<N extends TypeNameOneOrMany> = N extends GetDocumentTypeNamesGen
  ? GetDocumentTypeMapGen[N]
  : GetDocumentTypeMapGen[N[number]]

function is<N extends TypeNameOneOrMany>(typeName: N, _: any): _ is TypeForTypeNameOneOrMany<N>
function is<N extends TypeNameOneOrMany>(typeName: N): (_: any) => _ is TypeForTypeNameOneOrMany<N>
function is<N extends TypeNameOneOrMany>(typeName: N, _?: any): any {
  if (_) {
    if (Array.isArray(typeName)) {
      return typeName.some((typeName_) => _?._typeName === typeName_)
    } else {
      return typeName === _?._typeName
    }
  } else {
    return (_: any) => is(typeName, _)
  }
}

export const guards = {
  is,
  // isType,
  // hasAllFields,
  // allFields,
  hasField,
  // withField,
}

// function hasAllFields<T>(_: T): _ is T & FlattenUnion<T> {
//   return true
// }

// function allFields<T>(
//   _: T,
// ): undefined extends T
//   ? Partial<UnionToIntersection<Exclude<T, undefined>>> | undefined
//   : Partial<UnionToIntersection<T>> {
//   return _ as any
// }

type AllPropertyNames<X> = keyof UnionToIntersection<X>
function hasField<T extends {}, P extends AllPropertyNames<T>>(_: T, property: P): _ is T & Record<P, any> {
  return _.hasOwnProperty(property)
}

// function withField<T extends {}, P extends AllPropertyNames<T>>(
//   _: T,
//   propertyName: P,
// ): (T & Record<P, any>) | undefined {
//   return hasField<T, P>(_, propertyName) ? _ : undefined
// }

// type FlattenUnion<T> = {
//   [K in keyof UnionToIntersection<T>]: K extends keyof T
//     ? T[K] extends any[]
//       ? T[K]
//       : T[K] extends object
//       ? FlattenUnion<T[K]>
//       : T[K]
//     : UnionToIntersection<T>[K] | undefined
// }

type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never
