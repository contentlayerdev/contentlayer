import { makeSourcePlugin } from '@contentlayer/source-contentful'
import { defineConfig } from 'contentlayer/core'

export default defineConfig({
  source: makeSourcePlugin({
    accessToken: process.env['CONTENTFUL_ACCESS_TOKEN']!,
    spaceId: 'rfcpfiludecf',
    environmentId: 'master',
    schemaOverrides: {
      documentTypes: ['landing', 'blog', 'page', 'post', 'person', 'config'],
    },
  }),
})
