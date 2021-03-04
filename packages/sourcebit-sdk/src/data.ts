// Installed via `npm install sourcebit` -> node_modules/sourcebit/dist/index.js

export { guards } from './guards'

export type Cache = {
  documents: Document[]
}

export type Document<Data = GetTypes> = Data
//  & {
//   __meta: DocumentMeta
// }

export type DocumentBase = {
  __meta: DocumentMeta
  __computed?: Record<string, any>
} & Record<string, any>

export type DocumentMeta = {
  /**
   * Either coming from API-based CMS or based on the local file path
   * Optional concept as no system/workflow depends on IDs.
   */
  // id: string
  typeName: string
  // urlPath: string
  sourceFilePath: string
}

type Object = {}

declare global {
  // NOTE will be extended via `node_modules/@types/sourcebit-gen/index.d.ts`
  interface SourcebitGen {}
}

export type Image = {
  url: string
  alt?: string
}

export type DocumentType<Name extends keyof GetTypeMap> = GetType<Name>

export type ObjectType<
  // DocTypeName extends GetTypeNames,
  Path extends Join<PathsToStringProps<GetTypeMapSafe>, '.'>
  // > = any
> = GetTypeFromPath<GetTypeMap, Path>

type GetTypeFromPath<CurrentType, Path extends string> = UnwrapNullish<
  UnwrapArray<
    Path extends `${infer Segment}.${infer RestPath}`
      ? CurrentType extends Record<Segment, any>
        ? GetTypeFromPath<CurrentType[Segment], RestPath>
        : CurrentType
      : CurrentType extends Record<Path, any>
      ? CurrentType[Path]
      : CurrentType
  >
>

type UnwrapArray<T> = T extends (infer T_)[] ? T_ : T
type UnwrapNullish<T> = Exclude<T, undefined | null>

type PathsToStringProps<T> = T extends string
  ? []
  : T extends any[]
  ? PathsToStringProps<T[number]>
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>]
    }[Extract<keyof T, string>]

type Join<T extends string[], D extends string> = T extends []
  ? never
  : T extends [infer F]
  ? F
  : T extends [infer F, ...infer R]
  ? F extends string
    ? `${F}${D}${Join<Extract<R, string[]>, D>}` | `${F}`
    : never
  : string

// type XX = ObjectPath<SomeType>

export type GetTypeNames = SourcebitGen extends { typeNames: infer T } ? T : string
export type GetTypeMap = SourcebitGen extends { typeMap: infer T } ? T : Record<string, DocumentBase>
type GetTypeMapSafe = SourcebitGen extends { typeMap: infer T } ? T : Record<string, unknown>
export type GetType<Name extends keyof GetTypeMap> = GetTypeMap[Name]
export type GetTypes = SourcebitGen extends { types: infer T } ? T : DocumentBase

export function getDocumentsForPath({}: { cache: Cache; path: string }): Document[] {
  return []
}

export function getDocumentsOfType<TypeNames extends GetTypeNames>({}: {
  cache: Cache
  type: TypeNames
}): GetDocumentTypes<TypeNames> {
  return []
}

export function getAllPaths({}: { cache: Cache }) {}
export function getPathsWithPattern({}: { cache: Cache; pathPattern: string }) {}

export class SourcebitClient {
  cache: Cache
  constructor({ cache }: { cache: Cache }) {
    this.cache = cache
  }

  // getAllPaths(): string[] {
  //   return []
  // }

  getAllDocuments(): Document[] {
    return this.cache.documents
  }

  getDocumentsOfType<TypeNames extends GetTypeNames>({ type }: { type: TypeNames }): GetDocumentTypes<TypeNames> {
    return this.cache.documents.filter((_) => _.__meta.typeName === type) as any
  }

  // TODO come up with an API that allows for further filtering
  // getDocumentsForPath({ path }: { path: string }): Document[] {
  //   return []
  // }
}

type GetDocumentTypes<TypeNames> = Document<
  GetTypes extends infer Types ? (Types extends { __meta: { typeName: TypeNames } } ? Types : never) : never
>[]

/*

- document, paths
- one vs many
- filtering
  - based on fields conditioned on type


TODO: generate guards

*/
