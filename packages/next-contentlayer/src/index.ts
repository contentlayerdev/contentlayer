import { generateDotpkg, getConfigWatch } from 'contentlayer/core'
import type { NextConfig } from 'next/dist/next-server/server/config'
import { switchMap, tap } from 'rxjs/operators'

export type { NextConfig }

type PluginOptions = {}

export const withContentlayer =
  (pluginOptions: PluginOptions = {}) =>
  (nextConfig: Partial<NextConfig> = {}): Partial<NextConfig> => {
    getConfigWatch({
      configPath: './contentlayer.config.ts',
      cwd: process.cwd(),
    })
      .pipe(
        tap({ next: () => console.log(`Contentlayer config change detected. Updating type definitions and data...`) }),
        switchMap((source) => generateDotpkg({ source, watchData: true })),
      )
      .subscribe()

    return {
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
