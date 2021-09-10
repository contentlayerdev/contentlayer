import type * as core from '@contentlayer/core'
import { SourceProvideSchemaError } from '@contentlayer/core'
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

export type MakeSourcePlugin = (
  _: Args | LocalSchema.Thunk<Args> | LocalSchema.Thunk<Promise<Args>>,
) => Promise<core.SourcePlugin>

export const makeSource: MakeSourcePlugin = async (argsOrArgsThunk) => {
  const {
    documentTypes,
    contentDirPath,
    onUnknownDocuments = 'skip-warn',
    onMissingOrIncompatibleData = 'skip-warn',
    onExtraFieldData = 'warn',
    extensions,
    ...pluginOptions
  } = typeof argsOrArgsThunk === 'function' ? await argsOrArgsThunk() : argsOrArgsThunk

  const documentTypeDefs = (Array.isArray(documentTypes) ? documentTypes : Object.values(documentTypes)).map((_) =>
    _.def(),
  )
  const schemaDef = { documentTypeDefs }

  const options = {
    markdown: pluginOptions.markdown,
    mdx: pluginOptions.mdx,
    fieldOptions: {
      bodyFieldName: pluginOptions.fieldOptions?.bodyFieldName ?? 'body',
      typeFieldName: pluginOptions.fieldOptions?.typeFieldName ?? 'type',
    },
  }

  const flags: Flags = { onUnknownDocuments, onExtraFieldData, onMissingOrIncompatibleData }

  return {
    type: 'local',
    extensions: extensions ?? {},
    options,
    provideSchema: null as any,
    provideSchemaEff: pipe(
      makeCoreSchema({ schemaDef, options }),
      Sync.mapError((error) => new SourceProvideSchemaError({ error })),
    ),
    fetchData: null as any,
    fetchDataEff: fetchData({ schemaDef, flags, options, contentDirPath }),
  }
}
