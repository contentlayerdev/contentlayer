import type { Document, NestedDocument } from './data-types.js'
import type { DataCache } from './DataCache.js'

// export type ContentlayerTypesGenerated = ContentlayerGen extends { documentTypeMap: any, objectTypeMap: any } ? true : false

export type GetDocumentTypeMapGen<TDocument extends Document> = ContentlayerGen extends { documentTypeMap: infer T }
  ? T
  : Record<string, TDocument>

export type GetDocumentTypeGen<
  Name extends string,
  TDocument extends Document,
> = Name extends keyof GetDocumentTypeMapGen<TDocument> ? GetDocumentTypeMapGen<TDocument>[Name] : Document

export type GetDocumentTypesGen = ContentlayerGen extends { documentTypes: infer T } ? T : Document

export type GetDocumentTypeNamesGen = ContentlayerGen extends { documentTypeNames: infer T } ? T : string

export type GetNestedTypeMapGen = ContentlayerGen extends { objectTypeMap: infer T }
  ? T
  : Record<string, NestedDocument>
export type GetNestedTypeGen<Name extends string> = Name extends keyof GetNestedTypeMapGen
  ? GetNestedTypeMapGen[Name]
  : NestedDocument
export type GetNestedTypesGen = ContentlayerGen extends { objectTypes: infer T } ? T : NestedDocument
export type GetNestedTypeNamesGen = ContentlayerGen extends { objectTypeNames: infer T } ? T : string

export type GetAllTypeNamesGen = ContentlayerGen extends { allTypeNames: infer T } ? T : string

export type GetDataExportsGen = ContentlayerGen extends { dataExports: infer T }
  ? T
  : {
      allDocuments: DocumentGen[]
    }

export type GetFieldNamesForDefinitionGen<DefName extends string> =
  DefName extends keyof GetDocumentTypeMapGen<Document>
    ? keyof GetDocumentTypeGen<DefName, Document>
    : keyof GetNestedTypeGen<DefName>

declare global {
  // NOTE will be extended via `$YOUR_PROJECT/.contentlayer/generated/types.d.ts`
  interface ContentlayerGen {
    // documentTypes: DocumentTypes
    // documentTypeMap: DocumentTypeMap
    // documentTypeNames: DocumentTypeNames
    // nestedTypes: NestedTypes
    // nestedTypeMap: NestedTypeMap
    // nestedTypeNames: NestedTypeNames
    // allTypeNames: AllTypeNames
    // dataExports: DataExports
  }
}

export type CacheGen = Omit<DataCache.Cache, 'documents'> & { documents: DocumentGen[] }

export type DocumentGen = GetDocumentTypesGen
