import type { Thunk } from '@contentlayer/utils'
import type { E, HasClock, HasConsole, OT, S, T } from '@contentlayer/utils/effect'
import type { BundleMDXOptions } from 'mdx-bundler/dist/types'
import type { LiteralUnion } from 'type-fest'
import type * as unified from 'unified'

import type { HasCwd } from './cwd.js'
import type { DataCache } from './DataCache.js'
import type { SourceFetchDataError, SourceProvideSchemaError } from './errors.js'
import type { SchemaDef, StackbitExtension } from './schema/index.js'

export type SourcePluginType = LiteralUnion<'local' | 'contentful' | 'sanity', string>

export type PluginExtensions = {
  // TODO decentralized extension definitions + logic
  stackbit?: StackbitExtension.Config
}

export type PluginOptions = {
  markdown: MarkdownOptions | undefined
  mdx: MDXOptions | undefined
  date: DateOptions | undefined
  fieldOptions: FieldOptions
}

export type MarkdownOptions = {
  remarkPlugins?: unified.Pluggable[]
  rehypePlugins?: unified.Pluggable[]
}

export type MDXOptions = {
  remarkPlugins?: unified.Pluggable[]
  rehypePlugins?: unified.Pluggable[]
} & Omit<BundleMDXOptions<any>, 'xdmOptions'>

export type DateOptions = {
  /**
   * Use provided timezone (e.g. `America/New_York`)
   *
   * Based on: https://github.com/marnusw/date-fns-tz#zonedtimetoutc
   */
  timezone?: string
}

export type FieldOptions = {
  // TODO add to Jsdoc that `bodyFieldName` is just about the field name of the generated document type + data.
  // not about some front matter (as opposed to `typeFieldName` which concerns the front matter as well)
  /**
   * Name of the field containing the body/content extracted when `contentType` is `markdown` or `mdx`.
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

export type ProvideSchema = T.Effect<OT.HasTracer & HasConsole, SourceProvideSchemaError, SchemaDef>
export type FetchData = (_: {
  schemaDef: SchemaDef
  verbose: boolean
}) => S.Stream<
  OT.HasTracer & HasClock & HasCwd & HasConsole,
  never,
  E.Either<SourceFetchDataError | SourceProvideSchemaError, DataCache.Cache>
>

// export type MakeSourcePlugin = (
//   _: Args | Thunk<Args> | Thunk<Promise<Args>>,
// ) => Promise<core.SourcePlugin>

export type MakeSourcePlugin<TArgs extends PartialArgs> = (
  _: TArgs | Thunk<TArgs> | Thunk<Promise<TArgs>>,
) => Promise<SourcePlugin>

export type PartialArgs = {
  markdown?: MarkdownOptions | undefined
  mdx?: MarkdownOptions | undefined
  date?: DateOptions | undefined
  fieldOptions?: Partial<FieldOptions>
  extensions?: PluginExtensions
}

export const defaultFieldOptions: FieldOptions = {
  bodyFieldName: 'body',
  typeFieldName: 'type',
}

export const processArgs = async <TArgs extends PartialArgs>(
  argsOrArgsThunk: TArgs | Thunk<TArgs> | Thunk<Promise<TArgs>>,
): Promise<{
  extensions: PluginExtensions
  options: PluginOptions
  restArgs: Omit<TArgs, 'extensions' | 'fieldOptions' | 'markdown' | 'mdx' | 'date'>
}> => {
  const { extensions, fieldOptions, markdown, mdx, date, ...restArgs } =
    typeof argsOrArgsThunk === 'function' ? await argsOrArgsThunk() : argsOrArgsThunk

  const options: PluginOptions = {
    markdown,
    mdx,
    date,
    fieldOptions: {
      bodyFieldName: fieldOptions?.bodyFieldName ?? defaultFieldOptions.bodyFieldName,
      typeFieldName: fieldOptions?.typeFieldName ?? defaultFieldOptions.typeFieldName,
    },
  }

  return { extensions: extensions ?? {}, options, restArgs }
}
