import '@contentlayer/utils/effect/Tracing/Enable'

import * as core from '@contentlayer/core'
import { errorToString } from '@contentlayer/utils'
import { E, OT, pipe, S, T } from '@contentlayer/utils/effect'

export type NextPluginOptions = {
  configPath?: string | undefined
}

/** Seems like the next.config.js export function might be executed multiple times, so we need to make sure we only run it once */
let contentlayerInitialized = false

export const runContentlayerDev = async ({ configPath }: NextPluginOptions) => {
  if (contentlayerInitialized) return
  contentlayerInitialized = true

  await pipe(
    core.getConfigWatch({ configPath }),
    S.tapSkipFirstRight(() => T.log(`Contentlayer config change detected. Updating type definitions and data...`)),
    S.tapRight((config) => (config.source.options.disableImportAliasWarning ? T.unit : T.fork(core.validateTsconfig))),
    S.chainSwitchMapEitherRight((config) => core.generateDotpkgStream({ config, verbose: false, isDev: true })),
    S.tap(E.fold((error) => T.log(errorToString(error)), core.logGenerateInfo)),
    S.runDrain,
    runMain,
  )
}

export const runContentlayerBuild = async ({ configPath }: NextPluginOptions) => {
  if (contentlayerInitialized) return
  contentlayerInitialized = true

  await pipe(
    core.getConfig({ configPath }),
    T.chain((config) => core.generateDotpkg({ config, verbose: false })),
    T.tap(core.logGenerateInfo),
    OT.withSpan('next-contentlayer:runContentlayerBuild'),
    runMain,
  )
}

const runMain = core.runMain({ tracingServiceName: 'next-contentlayer', verbose: process.env.CL_DEBUG !== undefined })
