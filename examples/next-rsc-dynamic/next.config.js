const { withContentlayer } = require('next-contentlayer')

module.exports = withContentlayer({
  experimental: { appDir: true, },
})