import { makeSourcePlugin } from '@contentlayer/source-contentful'

export default makeSourcePlugin({
  accessToken: process.env['CONTENTFUL_ACCESS_TOKEN']!,
  spaceId: 'y5crayy7d02t',
  environmentId: 'dev',
  schemaOverrides: {
    documentTypes: {
      post: { defName: 'Post', fields: { body: { type: 'markdown' } } },
    },
  },
})
