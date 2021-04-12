import { Observable } from 'rxjs'
import { Cache } from './data'
import { SchemaDef } from './schema'

export { Observable } from 'rxjs'

export type SourcePlugin = {
  provideSchema: ProvideSchemaFn
  fetchData: FetchDataFn
  watchDataChange: () => Observable<void>
}

export type ProvideSchemaFn = () => SchemaDef | Promise<SchemaDef>
export type FetchDataFn = (_: {
  watch?: boolean
  force: boolean
  previousCache: Cache | undefined
}) => Observable<Cache>
