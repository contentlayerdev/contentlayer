import '@contentlayer/tracing-node'

import { generateDotpkg, getConfigWatch } from '@contentlayer/core'
import { tapSkipFirst } from '@contentlayer/utils'
import { logPerformance } from '@contentlayer/utils/node'
import type { NextConfig } from 'next/dist/next-server/server/config'
import { switchMap, tap } from 'rxjs/operators'

export type { NextConfig }

type PluginOptions = {}

export const withContentlayer =
  (_pluginOptions: PluginOptions = {}) =>
  (nextConfig: Partial<NextConfig> = {}): Partial<NextConfig> => {
    // could be either `next dev` or just `next`
    const isNextDev = process.argv.includes('dev') || process.argv.some((_) => _.endsWith('/.bin/next'))

    if (isNextDev) {
      logPerformance()

      getConfigWatch({
        configPath: './contentlayer.config.ts',
        cwd: process.cwd(),
      })
        .pipe(
          tapSkipFirst(() => console.log(`Contentlayer config change detected. Updating type definitions and data...`)),
          switchMap((source) => generateDotpkg({ source, watchData: true })),
          tap(() => console.log(`Generated node_modules/.contentlayer`)),
        )
        .subscribe()
    }

    return {
      ...nextConfig,
      webpack(config: any, options: any) {
        config.watchOptions = {
          ...config.watchOptions,
          // ignored: [/node_modules([\\]+|\/)+(?!\.contentlayer)/],
          ignored: ['**/node_modules/!(.contentlayer)/**/*'],
        }

        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, options)
        }

        return config
      },
    }
  }
