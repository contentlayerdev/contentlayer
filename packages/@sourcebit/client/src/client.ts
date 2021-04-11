import {
  Cache,
  CacheGen,
  Config,
  GetDocumentTypeGen,
  GetDocumentTypeNamesGen,
  GetDocumentTypesGen,
} from '@sourcebit/core'
import { guards } from './guards'

export class SourcebitClient {
  constructor(props?: { cache?: Cache; config?: Config }) {
    if (props?.cache) {
      this.cache = props.cache as any
      recRemoveUndefinedValues(this.cache)
    }
    if (props?.config) {
      this.config = props.config
    }
  }

  private cache: CacheGen | undefined
  private config: Config | undefined

  async fetchData(): Promise<void> {
    if (this.config === undefined) {
      throw new Error(
        `When running \`fetchData\`, you need to provide the \`config\` property when initializing the SourcebitClient`,
      )
    }
    const observable = await this.config.source.fetchData({
      watch: false,
      force: false,
      previousCache: this.cache as any,
    })
    this.cache = (await observable.toPromise()) as any
    recRemoveUndefinedValues(this.cache)
  }

  getAllDocuments(): GetDocumentTypesGen[] {
    assertCacheExists(this.cache)
    return this.cache.documents
  }

  getDocumentsOfType<TypeNames extends GetDocumentTypeNamesGen>({
    type,
  }: {
    type: TypeNames
  }): GetDocumentTypeGen<TypeNames>[] {
    assertCacheExists(this.cache)
    return this.cache.documents.filter(guards.is(type)) as any
  }
}

function assertCacheExists(cache: CacheGen | undefined): asserts cache is CacheGen {
  if (cache === undefined) {
    throw new Error(`You can't access SourcebitClient data before you haven't fetched`)
  }
}

/**
 * Next.js doesn't allow for returning `undefined` values in `getStaticProps`
 * TODO move this function to a better place
 */
function recRemoveUndefinedValues(val: any): void {
  if (Array.isArray(val)) {
    val.forEach(recRemoveUndefinedValues)
  } else if (typeof val === 'object') {
    Object.keys(val).forEach((key) => {
      if (val[key] === undefined) {
        delete val[key]
      } else {
        recRemoveUndefinedValues(val[key])
      }
    })
  }
}
