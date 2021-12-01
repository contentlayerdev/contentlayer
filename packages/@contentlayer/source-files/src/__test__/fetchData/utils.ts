import type { HasCwd } from '@contentlayer/core'
import * as core from '@contentlayer/core'
import { provideCwd } from '@contentlayer/core'
import { provideJaegerTracing, unknownToPosixFilePath } from '@contentlayer/utils'
import type { HasClock, HasConsole, OT } from '@contentlayer/utils/effect'
import { pipe, provideTestConsole, T, These } from '@contentlayer/utils/effect'

import { makeCacheItemFromFilePath } from '../../fetchData/fetchAllDocuments.js'
import { testOnly_makefilePathPatternMap } from '../../fetchData/index.js'
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
    const relativeFilePath = unknownToPosixFilePath(relativeFilePath_)
    const contentDirPath = unknownToPosixFilePath(contentDirPath_)

    const source = yield* $(T.tryPromise(() => makeSource({ contentDirPath, documentTypes })))
    const schemaDef = yield* $(source.provideSchema)

    const documentTypeDefs = (Array.isArray(documentTypes) ? documentTypes : Object.values(documentTypes)).map((_) =>
      _.def(),
    )
    const filePathPatternMap = testOnly_makefilePathPatternMap(documentTypeDefs)

    const defaultOptions: core.PluginOptions = {
      markdown: undefined,
      date: undefined,
      mdx: undefined,
      fieldOptions: core.defaultFieldOptions,
    }
    const cache = yield* $(
      pipe(
        makeCacheItemFromFilePath({
          relativeFilePath,
          contentDirPath,
          coreSchemaDef: schemaDef,
          filePathPatternMap,
          previousCache: undefined,
          options: defaultOptions,
        }),
        These.effectToEither,
      ),
    )

    return cache
  })

  return runMain(eff)
}

const runMain = async <E, A>(eff: T.Effect<OT.HasTracer & HasClock & HasCwd & HasConsole, E, A>) => {
  const logMessages: string[] = []
  const result = await pipe(
    eff,
    // T.either,
    provideTestConsole(logMessages),
    provideCwd,
    provideJaegerTracing('test'),
    T.runPromise,
  )

  return { logMessages, result }
}
