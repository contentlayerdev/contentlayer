import type { Observable } from 'rxjs'
import type { LiteralUnion } from 'type-fest'
import type { Pluggable } from 'unified'

import type { Cache } from './cache'
import type { SchemaDef, StackbitExtension } from './schema'

export type SourcePluginType = LiteralUnion<'local' | 'contentful' | 'sanity', string>

export type PluginExtensions = {
  stackbit?: StackbitExtension.Config
}

export type Options = {
  markdown?: MarkdownOptions
  mdx?: MarkdownOptions
}

export type MarkdownOptions = {
  remarkPlugins?: Pluggable[]
  rehypePlugins?: Pluggable[]
}

export type SourcePlugin = {
  type: SourcePluginType
  provideSchema: ProvideSchemaFn
  fetchData: FetchDataFn
} & Options & { extensions: PluginExtensions }

export type ProvideSchemaFn = () => SchemaDef | Promise<SchemaDef>
export type FetchDataFn = (_: { watch?: boolean }) => Observable<Cache>
