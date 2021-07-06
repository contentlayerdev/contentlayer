import '@contentlayer/tracing-node'

import { generateDotpkg, getConfig, getConfigWatch } from '@contentlayer/core'
import { tapSkipFirst } from '@contentlayer/utils'
import type { NextConfig } from 'next/dist/next-server/server/config'
import { firstValueFrom } from 'rxjs'
import { switchMap, tap } from 'rxjs/operators'

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
      runContentlayerDev({
        onGeneration: () => {
          console.log(`Generated node_modules/.contentlayer`)
          initialGenerationCompletedOpenPromise.resolve()
        },
      })
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

const runContentlayerDev = ({ onGeneration }: { onGeneration: () => void }) => {
  if (contentlayerInitialized) return
  contentlayerInitialized = true

  getConfigWatch({
    configPath: './contentlayer.config.ts',
    cwd: process.cwd(),
  })
    .pipe(
      tapSkipFirst(() => console.log(`Contentlayer config change detected. Updating type definitions and data...`)),
      switchMap((source) => generateDotpkg({ source, watchData: true })),
      tap(onGeneration),
    )
    .subscribe()
}

const runContentlayerBuild = async () => {
  if (contentlayerInitialized) return
  contentlayerInitialized = true

  const source = await getConfig({
    configPath: './contentlayer.config.ts',
    cwd: process.cwd(),
  })
  await firstValueFrom(generateDotpkg({ source, watchData: false }))
  console.log(`Generated node_modules/.contentlayer`)
}
