const { defineTransform } = require('contentlayer-stackbit-yaml-generator')

module.exports = defineTransform((config) => {
  config.pagesDir = 'content/pages'
  config.dataDir = 'content/data'

  config.models['Person'].folder = 'authors'
  config.models['Blog'].file = 'blog.md'
  config.models['Config'].file = 'config.json'
  config.models['Page'].match = ['about.md', 'privacy-policy.md', 'signup.md', 'style-guide.md', 'terms-of-service.md']
  config.models['Post'].match = 'blog/**.md'
  config.models['Landing'].match = ['contact.md', 'features.md', 'index.md', 'pricing.md']

  return config
})
