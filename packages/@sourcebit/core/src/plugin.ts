import { Observable } from 'rxjs'
import { Cache } from './data'
import { SchemaDef } from './schema'

export { Observable } from 'rxjs'

export type SourcePlugin = {
  provideSchema: ProvideSchemaFn
  fetchData: FetchDataFn
}

export type ProvideSchemaFn = (_?: any) => SchemaDef | Promise<SchemaDef>
export type FetchDataFn = (_: { watch?: boolean }) => Promise<Observable<Cache>>
