import { Cache, CacheGen, GetDocumentTypeGen, GetDocumentTypeNamesGen, GetDocumentTypesGen } from '@sourcebit/core'
import { guards } from './guards'

export class SourcebitClient {
  cache: CacheGen
  constructor({ cache }: { cache: Cache }) {
    this.cache = cache as CacheGen
  }

  getAllDocuments(): GetDocumentTypesGen[] {
    return this.cache.documents
  }

  getDocumentsOfType<TypeNames extends GetDocumentTypeNamesGen>({
    type,
  }: {
    type: TypeNames
  }): GetDocumentTypeGen<TypeNames>[] {
    return this.cache.documents.filter(guards.is(type))
  }
}
