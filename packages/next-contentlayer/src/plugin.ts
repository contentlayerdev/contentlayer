import '@contentlayer/utils/effect/Tracing/Enable'

import * as core from '@contentlayer/core'
import { errorToString, JaegerNodeTracing } from '@contentlayer/utils'
import type { HasClock } from '@contentlayer/utils/effect'
import { E, OT, pipe, pretty, S, T } from '@contentlayer/utils/effect'

/** Seems like the next.config.js export function might be executed multiple times, so we need to make sure we only run it once */
let contentlayerInitialized = false

export const runContentlayerDev = async () => {
  if (contentlayerInitialized) return
  contentlayerInitialized = true

  const cwd = process.cwd()

  await pipe(
    core.getConfigWatch({ cwd }),
    S.tapSkipFirstRight(() => T.log(`Contentlayer config change detected. Updating type definitions and data...`)),
    S.chainSwitchMapEitherRight((source) => core.generateDotpkgStream({ source, verbose: false, cwd })),
    S.tap(E.fold((error) => T.log(errorToString(error)), core.logGenerateInfo)),
    S.runDrain,
    runMainEffect,
  )
}

export const runContentlayerBuild = async () => {
  if (contentlayerInitialized) return
  contentlayerInitialized = true

  const cwd = process.cwd()

  await pipe(
    core.getConfig({ cwd: process.cwd() }),
    T.chain((source) => core.generateDotpkg({ source, verbose: false, cwd })),
    T.tap(core.logGenerateInfo),
    OT.withSpan('next-contentlayer:runContentlayerBuild'),
    runMainEffect,
  )
}

const runMainEffect = async (effect: T.Effect<OT.HasTracer & HasClock, unknown, unknown>) => {
  try {
    await pipe(
      effect,
      T.provideSomeLayer(JaegerNodeTracing('next-contentlayer')),
      T.tapCause((cause) => (process.env.CL_DEBUG ? T.die(pretty(cause)) : T.unit)),
      T.runPromise,
    )
  } catch (e: any) {
    if (e._tag !== 'HandledFetchDataError') {
      console.error(errorToString(e))
    }
    process.exit(1)
  }
}
