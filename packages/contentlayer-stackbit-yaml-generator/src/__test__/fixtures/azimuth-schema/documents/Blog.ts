import { defineDocumentType } from 'contentlayer2/source-files'

import { SEO } from '../nested/SEO.js'
import { urlFromFilePath } from '../utils.js'

export const Blog = defineDocumentType(() => ({
  name: 'Blog',
  filePathPattern: `pages/blog.md`,
  isSingleton: true,
  fields: {
    title: {
      type: 'string',
      description: 'The title of the page',
      required: true,
    },
    seo: { type: 'nested', of: SEO },
  },
  computedFields: {
    url_path: {
      type: 'string',
      description:
        'The URL path of this page relative to site root. For example, the site root page would be "/", and post page would be "posts/new-post/"',
      resolve: urlFromFilePath,
    },
  },
  extensions: {
    stackbit: {
      fields: {
        title: { label: 'Title' },
      },
      file: 'blog.md',
    },
  },
}))
