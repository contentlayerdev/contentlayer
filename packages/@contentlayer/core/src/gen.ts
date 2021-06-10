import type { Cache, Document } from './data'

export type GetDocumentTypeMapGen = ContentlayerGen extends { documentTypeMap: infer T } ? T : Record<string, Document>
export type GetDocumentTypeGen<Name extends string> = Name extends keyof GetDocumentTypeMapGen
  ? GetDocumentTypeMapGen[Name]
  : Document
export type GetDocumentTypesGen = ContentlayerGen extends { documentTypes: infer T } ? T : Document
export type GetDocumentTypeNamesGen = ContentlayerGen extends { documentTypeNames: infer T } ? T : string
export type GetAllTypeNamesGen = ContentlayerGen extends { allTypeNames: infer T } ? T : string

declare global {
  // NOTE will be extended via `node_modules/@types/contentlayer/types/index.d.ts`
  interface ContentlayerGen {}
}

export type CacheGen = Omit<Cache, 'documents'> & { documents: DocumentGen[] }

export type DocumentGen = GetDocumentTypesGen
