import type { Observable } from 'rxjs'

import type { Cache } from './data'
import type { SchemaDef } from './schema'

export type SourcePlugin = {
  provideSchema: ProvideSchemaFn
  fetchData: FetchDataFn
}

export type ProvideSchemaFn = () => SchemaDef | Promise<SchemaDef>
export type FetchDataFn = (_: {
  watch?: boolean
  /** Ignore `previousCache` */
  force: boolean
  previousCache: Cache | undefined
}) => Observable<Cache>
