import * as core from '@contentlayer/core'
import { processArgs, SourceProvideSchemaError } from '@contentlayer/core'
import { unknownToAbsolutePosixFilePath } from '@contentlayer/utils'
import { pipe, S, T } from '@contentlayer/utils/effect'

import { fetchData } from './fetchData/index.js'
import type * as LocalSchema from './schema/defs/index.js'
import { makeCoreSchema } from './schema/provideSchema.js'
import type { Flags, PluginOptions } from './types.js'

export * from './types.js'
export * from './schema/defs/index.js'

export type Args = {
  documentTypes: LocalSchema.DocumentTypes
  /**
   * Path to the root directory that contains all content. Every content file path will be relative
   * to this directory. This includes:
   *  - The `filePathPattern` option in `defineDocumentType` is relative to `contentDirPath`
   *  - Each document's `_raw` fields such as `flattenedPath`, `sourceFilePath`, `sourceFileDir`
   */
  contentDirPath: string

  /**
   * An array of paths that Contentlayer should include. They can be either files or directories.
   * The paths need to be relative to `contentDirPath` or absolute.
   * Glob/wildcard patterns (e.g. using `*`) are not supported yet.
   * An empty array means that all files in `contentDirPath` will be included.
   *
   * @default []
   *
   * @example
   * ```js
   * export default makeSource({
   *   // ...
   *   contentDirPath: '.',
   *   contentDirInclude: ['docs'],
   * })
   * ```
   */
  contentDirInclude?: string[]

  /**
   * An array of paths that Contentlayer should ignore. They can be either files or directories.
   * The paths need to be relative to `contentDirPath` or absolute.
   * Glob/wildcard patterns (e.g. using `*`) are not supported yet.
   *
   * `contentDirExclude` has a higher priority than `contentDirInclude`.
   *
   * @see {@link contentDirExcludeDefault} for default values
   *
   * @default ['node_modules', '.git', '.yarn', '.cache', '.next', '.contentlayer', 'package.json', 'tsconfig.json']
   *
   *
   * @example
   * ```js
   * export default makeSource({
   *   // ...
   *   contentDirPath: './content',
   *   contentDirExclude: ['internal-docs'],
   * })
   * ```
   */
  contentDirExclude?: string[]
  // NOTE https://github.com/parcel-bundler/watcher/issues/64

  /**
   * This is an experimental feature and should be ignored for now.
   */
  extensions?: {
    stackbit?: core.StackbitExtension.Config
  }
} & PluginOptions &
  Partial<Flags>

export const makeSource: core.MakeSourcePlugin<Args> = async (args) => {
  const {
    options,
    extensions,
    restArgs: {
      documentTypes,
      contentDirPath,
      contentDirInclude,
      contentDirExclude,
      onUnknownDocuments = 'skip-warn',
      onMissingOrIncompatibleData = 'skip-warn',
      onExtraFieldData = 'warn',
    },
  } = await processArgs(args)

  const flags: Flags = { onUnknownDocuments, onExtraFieldData, onMissingOrIncompatibleData }

  const documentTypeDefs = (Array.isArray(documentTypes) ? documentTypes : Object.values(documentTypes)).map((_) =>
    _.def(),
  )

  return {
    type: 'local',
    extensions: extensions ?? {},
    options,
    provideSchema: (esbuildHash) =>
      pipe(
        makeCoreSchema({ documentTypeDefs, options, esbuildHash }),
        T.mapError((error) => new SourceProvideSchemaError({ error })),
      ),
    fetchData: ({ schemaDef, verbose }) =>
      pipe(
        S.fromEffect(core.getCwd),
        S.chain((cwd) =>
          fetchData({
            coreSchemaDef: schemaDef,
            documentTypeDefs,
            flags,
            options,
            contentDirPath: unknownToAbsolutePosixFilePath(contentDirPath, cwd),
            contentDirExclude: (contentDirExclude ?? contentDirExcludeDefault).map((_) =>
              unknownToAbsolutePosixFilePath(_, cwd),
            ),
            contentDirInclude: (contentDirInclude ?? []).map((_) => unknownToAbsolutePosixFilePath(_, cwd)),
            verbose,
          }),
        ),
      ),
  }
}

export const contentDirExcludeDefault = ['node_modules', '.git', '.yarn', '.cache', '.next', '.contentlayer']
