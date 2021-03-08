import { Cache } from './data'
import { SchemaDef } from './schema'

export type SourcePlugin = {
  provideSchema: ProvideSchemaFn
  fetchData: FetchDataFn
}

export type ProvideSchemaFn = (_?: any) => SchemaDef | Promise<SchemaDef>
export type FetchDataFn = (_?: any) => Promise<Cache>
