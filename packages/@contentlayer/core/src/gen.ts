import type { Cache } from './cache'
import type { Document, Object } from './data'

export type GetDocumentTypeMapGen = ContentlayerGen extends { documentTypeMap: infer T } ? T : Record<string, Document>
export type GetDocumentTypeGen<Name extends string> = Name extends keyof GetDocumentTypeMapGen
  ? GetDocumentTypeMapGen[Name]
  : Document
export type GetDocumentTypesGen = ContentlayerGen extends { documentTypes: infer T } ? T : Document
export type GetDocumentTypeNamesGen = ContentlayerGen extends { documentTypeNames: infer T } ? T : string

export type GetObjectTypeMapGen = ContentlayerGen extends { objectTypeMap: infer T } ? T : Record<string, Object>
export type GetObjectTypeGen<Name extends string> = Name extends keyof GetObjectTypeMapGen
  ? GetObjectTypeMapGen[Name]
  : Object
export type GetObjectTypesGen = ContentlayerGen extends { objectTypes: infer T } ? T : Object
export type GetObjectTypeNamesGen = ContentlayerGen extends { objectTypeNames: infer T } ? T : string

export type GetAllTypeNamesGen = ContentlayerGen extends { allTypeNames: infer T } ? T : string

export type GetFieldNamesForDefinitionGen<DefName extends string> = DefName extends keyof GetDocumentTypeMapGen
  ? keyof GetDocumentTypeGen<DefName>
  : keyof GetObjectTypeGen<DefName>

declare global {
  // NOTE will be extended via `node_modules/@types/contentlayer/types/index.d.ts`
  interface ContentlayerGen {}
}

export type CacheGen = Omit<Cache, 'documents'> & { documents: DocumentGen[] }

export type DocumentGen = GetDocumentTypesGen
