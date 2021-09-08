import '@contentlayer/tracing-node'
import '@effect-ts/core/Tracing/Enable'

import { generateDotpkg, generateDotpkgStream, getConfig, getConfigWatch } from '@contentlayer/core'
import { effectUtils, JaegerNodeTracing } from '@contentlayer/utils'
import { pipe } from '@effect-ts/core'
import * as T from '@effect-ts/core/Effect'
import { pretty } from '@effect-ts/core/Effect/Cause'
import * as S from '@effect-ts/core/Effect/Stream'
import * as OT from '@effect-ts/otel'
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

  await pipe(
    getConfigWatch({ cwd: process.cwd() }),
    effectUtils.streamTapSkipFirst(() =>
      effectUtils.log(`Contentlayer config change detected. Updating type definitions and data...`),
    ),
    S.chainParSwitch(1, (source) => generateDotpkgStream({ source })),
    S.tap(() => effectUtils.log(`Generated node_modules/.contentlayer`)),
    S.tap(() => T.succeedWith(onGeneration)),
    S.runDrain,
    T.provideSomeLayer(JaegerNodeTracing('next-contentlayer')),
    T.tapCause((cause) => T.die(pretty(cause))),
    T.runPromise,
  )
}

const runContentlayerBuild = async () => {
  if (contentlayerInitialized) return
  contentlayerInitialized = true

  await pipe(
    getConfig({ cwd: process.cwd() }),
    T.chain((source) => generateDotpkg({ source })),
    T.tap(() => effectUtils.log(`Generated node_modules/.contentlayer`)),
    OT.withSpan('@contentlayer/cli/commands/BuildCommand:executeSafe'),
    T.provideSomeLayer(JaegerNodeTracing('next-contentlayer')),
    T.tapCause((cause) => T.die(pretty(cause))),
    T.runPromise,
  )
}
