import type { HasCwd } from '@contentlayer/core'
import * as core from '@contentlayer/core'
import { provideCwd } from '@contentlayer/core'
import type { fs } from '@contentlayer/utils'
import {
  provideDummyTracing,
  unknownToAbsolutePosixFilePath,
  unknownToRelativePosixFilePath,
} from '@contentlayer/utils'
import type { HasClock, HasConsole, OT } from '@contentlayer/utils/effect'
import { pipe, provideTestConsole, T, These } from '@contentlayer/utils/effect'
import { NodeFsLive } from '@contentlayer/utils/node'

import type { HasDocumentTypeMapState } from '../../fetchData/DocumentTypeMap.js'
import { provideDocumentTypeMapState } from '../../fetchData/DocumentTypeMap.js'
import { testOnly_makeContentTypeMap, testOnly_makefilePathPatternMap } from '../../fetchData/index.js'
import { makeCacheItemFromFilePath } from '../../fetchData/makeCacheItemFromFilePath.js'
import type { DocumentTypes } from '../../index.js'
import { makeSource } from '../../index.js'

export const runTest = async ({
  documentTypes,
  contentDirPath: contentDirPath_,
  relativeFilePath: relativeFilePath_,
}: {
  documentTypes: DocumentTypes
  contentDirPath: string
  relativeFilePath: string
}) => {
  const eff = T.gen(function* ($) {
    const relativeFilePath = unknownToRelativePosixFilePath(relativeFilePath_)
    const contentDirPath = unknownToAbsolutePosixFilePath(contentDirPath_)
    const esbuildHash = 'not-important-for-this-test'

    const source = yield* $(T.tryPromise(() => makeSource({ contentDirPath, documentTypes })(undefined)))
    const coreSchemaDef = yield* $(source.provideSchema(esbuildHash))

    const documentTypeDefs = (Array.isArray(documentTypes) ? documentTypes : Object.values(documentTypes)).map((_) =>
      _.def(),
    )
    const filePathPatternMap = testOnly_makefilePathPatternMap(documentTypeDefs)
    const contentTypeMap = testOnly_makeContentTypeMap(documentTypeDefs)

    const options: core.PluginOptions = {
      date: undefined,
      markdown: undefined,
      mdx: undefined,
      fieldOptions: core.defaultFieldOptions,
      disableImportAliasWarning: false,
      experimental: { enableDynamicBuild: false },
      onSuccess: undefined,
    }

    const cache = yield* $(
      pipe(
        makeCacheItemFromFilePath({
          relativeFilePath,
          contentDirPath,
          coreSchemaDef,
          filePathPatternMap,
          options,
          previousCache: undefined,
          contentTypeMap,
        }),
        These.effectToEither,
      ),
    )

    return cache
  })

  return runMain(eff)
}

const runMain = async <E, A>(
  eff: T.Effect<OT.HasTracer & HasClock & HasCwd & HasConsole & HasDocumentTypeMapState & fs.HasFs, E, A>,
) => {
  const logMessages: string[] = []
  const result = await pipe(
    eff,
    provideTestConsole(logMessages),
    provideDocumentTypeMapState,
    provideCwd,
    provideDummyTracing,
    T.provideSomeLayer(NodeFsLive),
    T.runPromise,
  )

  return { logMessages, result }
}
