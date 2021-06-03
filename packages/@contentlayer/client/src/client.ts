import type {
  Cache,
  CacheGen,
  Config,
  GetDocumentTypeGen,
  GetDocumentTypeNamesGen,
  GetDocumentTypesGen,
  SourcePlugin,
} from '@contentlayer/core'
import { recRemoveUndefinedValues } from '@contentlayer/utils'
import { firstValueFrom } from 'rxjs'

import { isType } from './guards'

export const getDocuments = (): GetDocumentTypesGen[] => new ContentlayerClient().getAllDocuments()

export class ContentlayerClient {
  constructor(props?: { cache?: Cache; source?: SourcePlugin }) {
    if (props?.source) {
      this.source = props.source
    } else {
      if (props?.cache) {
        this.setCache(props.cache)
      } else {
        // needs to use `eval` otherwise can't import from `node_modules`
        eval(`delete require.cache[require.resolve(".contentlayer/cache.json")]`)
        this.cache = eval(`require(".contentlayer/cache.json")`)
      }
    }
  }

  private cache: CacheGen | undefined
  private source: Config | undefined

  async fetchData(): Promise<void> {
    if (this.source === undefined) {
      throw new Error(
        `When running \`fetchData\`, you need to provide the \`source\` property when initializing the ContentlayerClient`,
      )
    }
    const observable = this.source.fetchData({
      watch: false,
      force: false,
      previousCache: this.cache as any,
    })
    const cache = await firstValueFrom(observable)
    this.setCache(cache)
  }

  private setCache = (cache: Cache) => {
    this.cache = cache as any

    // Next.js doesn't allow for returning `undefined` values in `getStaticProps`
    recRemoveUndefinedValues(this.cache)
  }

  // reloadCache() {
  //   this.cache = require(`${process.cwd()}/.contentlayer/cache.json`)
  // }

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
    return this.cache.documents.filter(isType(type)) as any
  }
}

function assertCacheExists(cache: CacheGen | undefined): asserts cache is CacheGen {
  if (cache === undefined) {
    throw new Error(`You can't access ContentlayerClient data before you haven't fetched`)
  }
}
