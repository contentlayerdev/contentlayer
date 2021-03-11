import { Observable } from 'rxjs'
import { Document } from './data'
import { SchemaDef } from './schema'

export { Observable } from 'rxjs'

export type SourcePlugin = {
  provideSchema: ProvideSchemaFn
  fetchData: FetchDataFn
}

export type ProvideSchemaFn = () => SchemaDef | Promise<SchemaDef>
export type FetchDataFn = (_: { watch?: boolean }) => Promise<Observable<{ documents: Document[] }>>
