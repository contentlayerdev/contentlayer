import { makeSourcePlugin } from '@contentlayer/source-contentful'

export default makeSourcePlugin({
  accessToken: process.env['CONTENTFUL_ACCESS_TOKEN']!,
  spaceId: 'rfcpfiludecf',
  environmentId: 'master',
  schemaOverrides: {
    documentTypes: ['landing', 'blog', 'page', 'post', 'person', 'config'],
  },
})
