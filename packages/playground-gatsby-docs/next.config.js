const { withContentlayer } = require('next-contentlayer')

module.exports = withContentlayer()({
  future: {
    webpack5: true,
  },
})
