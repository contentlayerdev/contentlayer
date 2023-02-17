const { withContentlayer } = require('next-contentlayer')

module.exports = withContentlayer({
  experimental: { appDir: true, esmExternals: 'loose', serverComponentsExternalPackages: ['mdx-bundler', 'string_decoder'], },
})