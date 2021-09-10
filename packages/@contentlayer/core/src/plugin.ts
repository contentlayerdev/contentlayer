import type { E, OT, S, T } from '@contentlayer/utils/effect'
import type { Observable } from 'rxjs'
import type { LiteralUnion } from 'type-fest'
import type * as unified from 'unified'

import type { Cache } from './cache'
import type { SourceFetchDataError, SourceProvideSchemaError } from './errors'
import type { SchemaDef, StackbitExtension } from './schema'

export type SourcePluginType = LiteralUnion<'local' | 'contentful' | 'sanity', string>

export type PluginExtensions = {
  // TODO decentralized extension definitions + logic
  stackbit?: StackbitExtension.Config
}

export type PluginOptions = {
  markdown: MarkdownOptions | undefined
  mdx: MarkdownOptions | undefined
  fieldOptions: FieldOptions
}

export type MarkdownOptions = {
  remarkPlugins?: unified.Pluggable[]
  rehypePlugins?: unified.Pluggable[]
}

export type FieldOptions = {
  // TODO add to Jsdoc that `bodyFieldName` is just about the field name of the generated document type + data.
  // not about some front matter (as opposed to `typeFieldName` which concerns the front matter as well)
  /**
   * Name of the field containing the body/content extracted when `bodyType` is `markdown` or `mdx`.
   * @default "body"
   */
  bodyFieldName: string

  /**
   * Name of the field containing the name of the document type (or nested document type).
   * @default "type"
   */
  typeFieldName: string
}

export type SourcePlugin = {
  type: SourcePluginType
  provideSchema: ProvideSchemaFn
  provideSchemaEff?: ProvideSchemaEff
  fetchData: FetchDataFn
  fetchDataEff?: FetchDataEff
} & {
  options: PluginOptions
  extensions: PluginExtensions
}

export type ProvideSchemaFn = () => SchemaDef | Promise<SchemaDef>
export type ProvideSchemaEff = T.Effect<unknown, SourceProvideSchemaError, SchemaDef>
export type FetchDataFn = (_: { watch?: boolean }) => Observable<Cache>
export type FetchDataEff = S.Stream<OT.HasTracer, never, E.Either<SourceFetchDataError, Cache>>
