import '@contentlayer/utils/effect/Tracing/Enable'

import * as core from '@contentlayer/core'
import { errorToString, JaegerNodeTracing } from '@contentlayer/utils'
import type { HasClock } from '@contentlayer/utils/effect'
import { E, OT, pipe, pretty, S, T } from '@contentlayer/utils/effect'
import type { NextConfig } from 'next'

import { createOpenPromise } from './utils'

export type { NextConfig }

const initialGenerationCompletedOpenPromise = createOpenPromise()

type PluginOptions = {}

export const withContentlayer =
  (_pluginOptions: PluginOptions = {}) =>
  (nextConfig: Partial<NextConfig> = {}): Partial<NextConfig> => {
    // could be either `next dev` or just `next`
    const isNextDev = process.argv.includes('dev') || process.argv.some((_) => _.endsWith('/.bin/next'))
    const isBuild = process.argv.includes('build')

    if (isNextDev) {
      runContentlayerDev({ onGeneration: () => initialGenerationCompletedOpenPromise.resolve() })
    }

    return {
      ...nextConfig,
      // Since Next.js doesn't provide some kind of real "plugin system" we're (ab)using the `redirects` option here
      // in order to hook into and block the `next build` and initial `next dev` run.
      redirects: async () => {
        if (isBuild) {
          await runContentlayerBuild()
        } else if (isNextDev) {
          // wait for first generation to be completed
          await initialGenerationCompletedOpenPromise.promise
        }

        return nextConfig.redirects?.() ?? []
      },
      webpack(config: any, options: any) {
        config.watchOptions = {
          ...config.watchOptions,
          // ignored: /node_modules([\\]+|\/)+(?!\.contentlayer)/,
          ignored: ['**/node_modules/!(.contentlayer)/**/*'],
        }

        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, options)
        }

        return config
      },
    }
  }

/** Seems like the next.config.js export function might be executed multiple times, so we need to make sure we only run it once */
let contentlayerInitialized = false

const runContentlayerDev = async ({ onGeneration }: { onGeneration: () => void }) => {
  if (contentlayerInitialized) return
  contentlayerInitialized = true

  const cwd = process.cwd()

  await pipe(
    core.getConfigWatch({ cwd }),
    S.tapSkipFirstRight(() => T.log(`Contentlayer config change detected. Updating type definitions and data...`)),
    S.chainSwitchMapEitherRight((source) => core.generateDotpkgStream({ source, verbose: false, cwd })),
    S.tap(E.fold((error) => T.log(errorToString(error)), core.logGenerateInfo)),
    S.tapRight(() => T.succeedWith(onGeneration)),
    S.runDrain,
    runMainEffect,
  )
}

const runContentlayerBuild = async () => {
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
