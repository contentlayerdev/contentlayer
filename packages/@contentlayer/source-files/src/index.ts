import type * as core from '@contentlayer/core'
import { processArgs, SourceProvideSchemaError } from '@contentlayer/core'
import { unknownToPosixFilePath } from '@contentlayer/utils'
import { pipe, T } from '@contentlayer/utils/effect'

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
   *  - `filePathPattern` is relative to `contentDirPath`
   *  - `_raw` fields such as `flattenedPath`, `sourceFilePath`, `sourceFileDir`
   */
  contentDirPath: string

  /**
   * An array of paths that Contentlayer should ignore. They can be either files or directories.
   * The paths need to be relative to `contentDirPath` or absolute.
   * Glob/wildcard patterns (e.g. using `*`) are not support yet.
   *
   * @see {@link contentDirIgnoreDefault} for default values
   *
   * @default ['node_modules', '.git', '.yarn', '.cache', '.next', '.contentlayer', 'package.json', 'tsconfig.json']
   *
   *
   * @example
   * ```js
   * export default makeSource({
   *   // ...
   *   contentDirPath: './content',
   *   contentDirIgnore: ['internal-docs'],
   * })
   * ```
   */
  contentDirIgnore?: string[]
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
      contentDirIgnore,
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
      fetchData({
        coreSchemaDef: schemaDef,
        documentTypeDefs,
        flags,
        options,
        contentDirPath: unknownToPosixFilePath(contentDirPath),
        contentDirIgnore: (contentDirIgnore ?? contentDirIgnoreDefault).map((_) => unknownToPosixFilePath(_)),
        verbose,
      }),
  }
}

export const contentDirIgnoreDefault = [
  'node_modules',
  '.git',
  '.yarn',
  '.cache',
  '.next',
  '.contentlayer',
  'package.json',
  'tsconfig.json',
]
