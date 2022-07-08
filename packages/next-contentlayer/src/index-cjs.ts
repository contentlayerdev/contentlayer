import type { NextConfig } from 'next'

import type { NextPluginOptions } from './plugin.js'

export type { NextConfig }

let devServerStarted = false

const defaultPluginOptions: NextPluginOptions = {}
module.exports.defaultPluginOptions = defaultPluginOptions

/**
 * This function allows you to provide custom plugin options (currently there are none however).
 *
 * @example
 * ```js
 * // next.config.js
 * const { createContentlayerPlugin } = require('next-contentlayer')
 *
 * const withContentlayer = createContentlayerPlugin({ configPath: './content/contentlayer.config.ts' })
 *
 * module.exports = withContentlayer({
 *   // My Next.js config
 * })
 * ```
 */
module.exports.createContentlayerPlugin =
  (pluginOptions: NextPluginOptions = defaultPluginOptions) =>
  (nextConfig: Partial<NextConfig> = {}): Partial<NextConfig> => {
    // could be either `next dev` or just `next`
    const isNextDev =
      process.argv.includes('dev') || process.argv.some((_) => _.endsWith('bin/next') || _.endsWith('bin\\next'))
    const isBuild = process.argv.includes('build')

    return {
      ...nextConfig,
      // Since Next.js doesn't provide some kind of real "plugin system" we're (ab)using the `redirects` option here
      // in order to hook into and block the `next build` and initial `next dev` run.
      redirects: async () => {
        // TODO move to post-install?
        const { checkConstraints } = await import('./check-constraints.js')
        checkConstraints()

        // NOTE since next.config.js doesn't support ESM yet, this "CJS -> ESM bridge" is needed
        const { runContentlayerBuild, runContentlayerDev } = await import('./plugin.js')
        if (isBuild) {
          await runContentlayerBuild(pluginOptions)
        } else if (isNextDev && !devServerStarted) {
          devServerStarted = true
          // TODO also block here until first Contentlayer run is complete
          runContentlayerDev(pluginOptions)
        }

        return nextConfig.redirects?.() ?? []
      },
      onDemandEntries: {
        maxInactiveAge: 60 * 60 * 1000, // extend `maxInactiveAge` to 1 hour (from 15 sec by default)
        ...nextConfig.onDemandEntries, // use existing onDemandEntries config if provided by user
      },
      webpack(config: any, options: any) {
        config.watchOptions = {
          ...config.watchOptions,
          // ignored: /node_modules([\\]+|\/)+(?!\.contentlayer)/,
          ignored: ['**/node_modules/!(.contentlayer)/**/*'],
        }

        // NOTE workaround for https://github.com/vercel/next.js/issues/17806#issuecomment-913437792
        // https://github.com/contentlayerdev/contentlayer/issues/121
        config.module.rules.push({
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
 * // next.config.js
 * const { withContentlayer } = require('next-contentlayer')
 *
 * module.exports = withContentlayer({
 *   // My Next.js config
 * })
 * ```
 */
module.exports.withContentlayer = module.exports.createContentlayerPlugin(defaultPluginOptions)
