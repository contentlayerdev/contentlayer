import {
  Cache,
  CacheGen,
  Config,
  GetDocumentTypeGen,
  GetDocumentTypeNamesGen,
  GetDocumentTypesGen,
} from '@contentlayer/core'
import { isType } from './guards'

export class ContentlayerClient {
  constructor(props?: { cache?: Cache; config?: Config }) {
    if (props?.config) {
      this.config = props.config
    } else {
      if (props?.cache) {
        this.cache = props.cache as any
        recRemoveUndefinedValues(this.cache)
      } else {
        // this.cache = require(`${process.cwd()}/node_modules/.contentlayer/cache.json`)
        eval(`delete require.cache[require.resolve(".contentlayer/cache.json")]`)
        this.cache = eval(`require(".contentlayer/cache.json")`)

        // if (process.env.NODE_ENV === 'development') {
        //   import('fs').then((fs) => {
        //     fs.watchFile(`${process.cwd()}/node_modules/.contentlayer/cache.json`, () => {
        //       eval(`delete require.cache[require.resolve(".contentlayer/cache.json")]`)
        //       this.cache = eval(`require(".contentlayer/cache.json")`)
        //     })
        //   })
        // }
      }
    }
  }

  private cache: CacheGen | undefined
  private config: Config | undefined

  async fetchData(): Promise<void> {
    if (this.config === undefined) {
      throw new Error(
        `When running \`fetchData\`, you need to provide the \`config\` property when initializing the ContentlayerClient`,
      )
    }
    const observable = this.config.source.fetchData({
      watch: false,
      force: false,
      previousCache: this.cache as any,
    })
    this.cache = (await observable.toPromise()) as any
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
