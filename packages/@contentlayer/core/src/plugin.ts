import type { Thunk } from '@contentlayer/utils'
import type { E, HasClock, HasConsole, OT, S, T } from '@contentlayer/utils/effect'
import type * as mdxBundler from 'mdx-bundler/dist/types'
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
  markdown: MarkdownOptions | MarkdownUnifiedBuilderCallback | undefined
  mdx: MDXOptions | undefined
  date: DateOptions | undefined
  fieldOptions: FieldOptions
  disableImportAliasWarning: boolean
}

/**
 * Please make sure to use the following Unified plugins for Contentlayer to work properly:
 *
 * @example
 * ```ts
 * import rehypeStringify from 'rehype-stringify'
 * import remarkFrontmatter from 'remark-frontmatter'
 * import remarkParse from 'remark-parse'
 * import remark2rehype from 'remark-rehype'
 *
 * makeSource({
 *   // your other options ...
 *   markdown: (builder) => {
 *     builder
 *       .use(remarkFrontmatter)
 *       .use(remarkParse)
 *       .use(remark2rehype)
 *       .use(rehypeStringify)
 *   }
 * })
 * ```
 */
export type MarkdownUnifiedBuilderCallback = (builder: unified.Processor) => void

export type MarkdownOptions = {
  remarkPlugins?: unified.Pluggable[]
  rehypePlugins?: unified.Pluggable[]
}

export type MDXOptions = {
  remarkPlugins?: unified.Pluggable[]
  rehypePlugins?: unified.Pluggable[]
  /**  */
  /**
   * This allows you to modify the built-in MDX configuration (passed to @mdx-js/mdx compile).
   * This can be helpful for specifying your own remarkPlugins/rehypePlugins.
   *
   * If you're providing `mdxOptions` then `rehypePlugins` and `remarkPlugins` will be ignored.
   */
  mdxOptions?: MDXBundlerMDXOptions
  /**
   * How we resolve the cwd passed to mdx-bundler when processing a file. If an explicit `cwd`
   * is provided this option will be ignored.
   * - `relative` sets the cwd to the directory the file resides in.
   * - `contentDirPath` sets the cwd to the contentDirPath. This was the default behavior up until v0.2.6.
   * @default "relative"
   */
  resolveCwd?: 'relative' | 'contentDirPath'
} & Omit<mdxBundler.BundleMDXOptions<any>, 'mdxOptions'>

export type MDXBundlerMDXOptions = mdxBundler.BundleMDXOptions<any>['mdxOptions']

export type DateOptions = {
  /**
   * Use provided timezone (e.g. `America/New_York`)
   *
   * Based on: https://tc39.es/proposal-temporal/docs/timezone.html
   *
   * NOTE The provided timezone will only be used for values that don't already have a timezone set.
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

export type ProvideSchema = (
  esbuildHash: string,
) => T.Effect<OT.HasTracer & HasConsole, SourceProvideSchemaError, SchemaDef>
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
  markdown?: MarkdownOptions | MarkdownUnifiedBuilderCallback | undefined
  mdx?: MDXOptions | undefined
  date?: DateOptions | undefined
  fieldOptions?: Partial<FieldOptions>
  extensions?: PluginExtensions
  disableImportAliasWarning?: boolean
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
  restArgs: Omit<TArgs, 'extensions' | 'fieldOptions' | 'markdown' | 'mdx' | 'date' | 'disableImportAliasWarning'>
}> => {
  const { extensions, fieldOptions, markdown, mdx, date, disableImportAliasWarning, ...restArgs } =
    typeof argsOrArgsThunk === 'function' ? await argsOrArgsThunk() : argsOrArgsThunk

  const options: PluginOptions = {
    markdown,
    mdx,
    date,
    fieldOptions: {
      bodyFieldName: fieldOptions?.bodyFieldName ?? defaultFieldOptions.bodyFieldName,
      typeFieldName: fieldOptions?.typeFieldName ?? defaultFieldOptions.typeFieldName,
    },
    disableImportAliasWarning: disableImportAliasWarning ?? false,
  }

  return { extensions: extensions ?? {}, options, restArgs }
}
