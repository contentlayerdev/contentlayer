import type { NextConfig } from 'next'
import type webpack from 'webpack'

import { type NextPluginOptions, runBeforeWebpackCompile } from './plugin.js'

export type { NextConfig }

const devServerStartedRef = { current: false }

export const defaultPluginOptions: NextPluginOptions = {}

/**
 * This function allows you to provide custom plugin options (currently there are none however).
 *
 * @example
 * ```js
 * // next.config.mjs
 * import { createContentlayerPlugin } from 'next-contentlayer'
 *
 * const withContentlayer = createContentlayerPlugin({ configPath: './content/contentlayer.config.ts' })
 *
 * export default withContentlayer({
 *   // My Next.js config
 * })
 * ```
 */
export const createContentlayerPlugin =
  (pluginOptions: NextPluginOptions = defaultPluginOptions) =>
  (nextConfig: Partial<NextConfig> = {}): Partial<NextConfig> => {
    return {
      ...nextConfig,
      onDemandEntries: {
        maxInactiveAge: 60 * 60 * 1000, // extend `maxInactiveAge` to 1 hour (from 15 sec by default)
        ...nextConfig.onDemandEntries, // use existing onDemandEntries config if provided by user
      },
      webpack(config: webpack.Configuration, options: any) {
        config.watchOptions = {
          ...config.watchOptions,
          // ignored: /node_modules([\\]+|\/)+(?!\.contentlayer)/,
          ignored: ['**/node_modules/!(.contentlayer)/**/*'],
        }

        config.plugins!.push(new ContentlayerWebpackPlugin(pluginOptions))

        // NOTE workaround for https://github.com/vercel/next.js/issues/17806#issuecomment-913437792
        // https://github.com/contentlayerdev/contentlayer/issues/121
        config.module?.rules?.push({
          test: /\.m?js$/,
          type: 'javascript/auto',
          resolve: {
            fullySpecified: false,
          },
        })

        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, options)
        }

        return config
      },
    }
  }

/**
 * Next.js plugin for Contentlayer with default options.
 *
 * If you want to provide custom plugin options, please use {@link createContentlayerPlugin} instead.
 *
 * @example
 * ```js
 * // next.config.mjs
 * import { withContentlayer } from 'next-contentlayer'
 *
 * export default withContentlayer({
 *   // My Next.js config
 * })
 * ```
 */
export const withContentlayer = createContentlayerPlugin(defaultPluginOptions)

class ContentlayerWebpackPlugin {
  constructor(readonly pluginOptions: NextPluginOptions) {}

  apply(compiler: webpack.Compiler) {
    compiler.hooks.beforeCompile.tapPromise('ContentlayerWebpackPlugin', async () => {
      await runBeforeWebpackCompile({
        pluginOptions: this.pluginOptions,
        devServerStartedRef,
        mode: compiler.options.mode,
      })
    })
  }
}
