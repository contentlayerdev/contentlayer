import { tapSkipFirst } from '@contentlayer/utils'
import { generateDotpkg, getConfigWatch } from 'contentlayer/core'
import { logPerformance } from 'contentlayer/utils/node'
import type { NextConfig } from 'next/dist/next-server/server/config'
import { switchMap, tap } from 'rxjs/operators'

export type { NextConfig }

type PluginOptions = {}

export const withContentlayer =
  (pluginOptions: PluginOptions = {}) =>
  (nextConfig: Partial<NextConfig> = {}): Partial<NextConfig> => {
    const isNextDev = process.argv.includes('dev')

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
      webpack5: true as any,
      ...nextConfig,
      webpack(config: any, options: any) {
        config.watchOptions = {
          ignored: /node_modules([\\]+|\/)+(?!\.contentlayer)/,
        }

        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, options)
        }

        return config
      },
    }
  }
