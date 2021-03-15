import { Cache, CacheGen, GetDocumentTypeGen, GetDocumentTypeNamesGen, GetDocumentTypesGen } from '@sourcebit/core'
import { guards } from './guards'

export type SourcebitClient = {
  cache: CacheGen
  getAllDocuments: () => GetDocumentTypesGen[]
  getDocumentsOfType: <TypeNames extends GetDocumentTypeNamesGen>({
    type,
  }: {
    type: TypeNames
  }) => GetDocumentTypeGen<TypeNames>[]
}

/** By defaults uses Sourcebit cache in `node_modules/.sourcebit/cache.json` */
export const createSourcebitClient = ({ cache }: { cache: Cache }): SourcebitClient => {
  return {
    cache,
    getAllDocuments: () => cache.documents,
    getDocumentsOfType: ({ type }) => cache.documents.filter(guards.is(type)),
  }
}
