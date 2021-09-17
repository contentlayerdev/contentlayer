import type * as core from '@contentlayer/core'
import { processArgs, SourceProvideSchemaError } from '@contentlayer/core'
import { pipe, Sync } from '@contentlayer/utils/effect'

import { fetchData } from './fetchData'
import type * as LocalSchema from './schema/defs'
import { makeCoreSchema } from './schema/provideSchema'
import type { Flags, PluginOptions } from './types'

export * from './types'
export * from './schema/defs'

export type Args = {
  // Note `<any>` generic parameter is needed here to avoid a consumer-side type error related to computed fields
  // This might need further investigation in the future (probably related to co-/contra-variance)
  documentTypes: LocalSchema.DocumentType<any>[] | Record<string, LocalSchema.DocumentType<any>>
  /**
   * Path to the root directory that contains all content. Every content file path will be relative
   * to this directory. This includes:
   *  - `filePathPattern` is relative to `contentDirPath`
   *  - `_raw` fields such as `flattenedPath`, `sourceFilePath`, `sourceFileDir`
   */
  contentDirPath: string
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
    provideSchema: pipe(
      makeCoreSchema({ documentTypeDefs, options }),
      Sync.mapError((error) => new SourceProvideSchemaError({ error })),
    ),
    fetchData: ({ schemaDef, verbose, cwd }) =>
      fetchData({ coreSchemaDef: schemaDef, documentTypeDefs, flags, options, contentDirPath, verbose, cwd }),
  }
}
