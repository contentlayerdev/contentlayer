import * as core from '@contentlayer/core'
import * as StackbitCore from '@contentlayer/experimental-stackbit-core'
import * as SourceFiles from '@contentlayer/source-files'
import { Either, OT, pipe, S, Stream, T } from '@contentlayer/utils/effect'
import type { Config } from '@stackbit/sdk'

import { fetchData } from './fetchData.js'

export type Args = {
  dirPath?: string
  onSuccess?: core.SuccessCallback
}

export const makeSource: core.MakeSourcePlugin<Args> = (args) => async (sourceKey) => {
  const {
    options,
    restArgs: { dirPath = '' },
  } = await core.processArgs(args, sourceKey)

  const provideSchema = (esbuildHash: string) =>
    pipe(
      StackbitCore.loadStackbitConfigAsDocumentTypes({ dirPath, fetchSchema: true }),
      T.chain((documentTypes) => {
        const documentTypeDefs = documentTypes.map((_) => _.def())
        return SourceFiles.makeCoreSchema({ documentTypeDefs, options, esbuildHash })
      }),
      T.mapError((error) => new core.SourceProvideSchemaError({ error })),
      OT.withSpan('@contentlayer/experimental-source-stackbit:provideSchema'),
    )

  return {
    type: 'experimental-stackbit',
    extensions: {},
    options,
    provideSchema,
    fetchData: ({ schemaDef, verbose, skipCachePersistence }) =>
      pipe(
        pipe(
          StackbitCore.loadStackbitConfig({ dirPath }),
          OT.withSpan('@contentlayer/experimental-source-stackbit:loadStackbitConfig'),
          S.fromEffect,
        ),
        S.chain((stackbitConfig) =>
          fetchData({
            stackbitConfig: stackbitConfig as Config,
            coreSchemaDef: schemaDef,
            options,
            verbose,
            skipCachePersistence,
          }),
        ),
        S.catchTag('StackbitError', (error) =>
          Stream.fromValue(Either.left(new core.SourceProvideSchemaError({ error }))),
        ),
        OT.withStreamSpan('@contentlayer/experimental-source-stackbit:fetchData'),
      ),
  }
}
