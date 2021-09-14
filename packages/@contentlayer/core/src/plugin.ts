import type { Thunk } from '@contentlayer/utils'
import type { Clock, E, Has, OT, S, T } from '@contentlayer/utils/effect'
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
  provideSchema: ProvideSchema
  fetchData: FetchData
} & {
  options: PluginOptions
  extensions: PluginExtensions
}

export type ProvideSchema = T.Effect<OT.HasTracer, SourceProvideSchemaError, SchemaDef>
export type FetchData = (_: {
  schemaDef: SchemaDef
}) => S.Stream<OT.HasTracer & Has<Clock.Clock>, never, E.Either<SourceFetchDataError | SourceProvideSchemaError, Cache>>

// export type MakeSourcePlugin = (
//   _: Args | Thunk<Args> | Thunk<Promise<Args>>,
// ) => Promise<core.SourcePlugin>

export type MakeSourcePlugin<TArgs extends PartialArgs> = (
  _: TArgs | Thunk<TArgs> | Thunk<Promise<TArgs>>,
) => Promise<SourcePlugin>

export type PartialArgs = {
  markdown?: MarkdownOptions | undefined
  mdx?: MarkdownOptions | undefined
  fieldOptions?: Partial<FieldOptions>
  extensions?: PluginExtensions
}

export const processArgs = async <TArgs extends PartialArgs>(
  argsOrArgsThunk: TArgs | Thunk<TArgs> | Thunk<Promise<TArgs>>,
): Promise<{
  extensions: PluginExtensions
  options: PluginOptions
  restArgs: Omit<TArgs, 'extensions' | 'fieldOptions' | 'markdown' | 'mdx'>
}> => {
  const { extensions, fieldOptions, markdown, mdx, ...restArgs } =
    typeof argsOrArgsThunk === 'function' ? await argsOrArgsThunk() : argsOrArgsThunk

  const options: PluginOptions = {
    markdown: markdown,
    mdx: mdx,
    fieldOptions: {
      bodyFieldName: fieldOptions?.bodyFieldName ?? 'body',
      typeFieldName: fieldOptions?.typeFieldName ?? 'type',
    },
  }

  return { extensions: extensions ?? {}, options, restArgs }
}
