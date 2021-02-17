// Installed via `npm install sourcebit` -> node_modules/sourcebit/dist/index.js

export type Cache = {
  documents: Document[]
}

export type Document<Data = GetTypes> = Data
//  & {
//   __meta: DocumentMeta
// }

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

type GetTypeNames = SourcebitGen extends { typeNames: infer T } ? T : string
type GetTypeMap = SourcebitGen extends { typeMap: infer T }
  ? T
  : Record<string, any>
type GetTypes = SourcebitGen extends { types: infer T }
  ? T
  : { __meta: DocumentMeta } & Record<string, any>

export function getDocumentsForPath({}: {
  cache: Cache
  path: string
}): Document[] {
  return []
}

type Guards = { [K in keyof GetTypeMap]: (_: any) => _ is GetTypeMap[K] }
export const guards: Guards = new Proxy(
  {},
  {
    get: (target, prop) => {
      return (_: any) => _?.__meta?.typeName === prop
    },
  },
)

export function getDocumentsOfType<TypeNames extends GetTypeNames>({}: {
  cache: Cache
  type: TypeNames
}): GetDocumentTypes<TypeNames> {
  return []
}

export function getAllPaths({}: { cache: Cache }) {}
export function getPathsWithPattern({}: {
  cache: Cache
  pathPattern: string
}) {}

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

  getDocumentsOfType<TypeNames extends GetTypeNames>({
    type,
  }: {
    type: TypeNames
  }): GetDocumentTypes<TypeNames> {
    return this.cache.documents.filter((_) => _.__meta.typeName === type) as any
  }

  // TODO come up with an API that allows for further filtering
  // getDocumentsForPath({ path }: { path: string }): Document[] {
  //   return []
  // }
}

type GetDocumentTypes<TypeNames> = Document<
  GetTypes extends infer Types
    ? Types extends { __meta: { typeName: TypeNames } }
      ? Types
      : never
    : never
>[]

/*

- document, paths
- one vs many
- filtering
  - based on fields conditioned on type


TODO: generate guards

*/
