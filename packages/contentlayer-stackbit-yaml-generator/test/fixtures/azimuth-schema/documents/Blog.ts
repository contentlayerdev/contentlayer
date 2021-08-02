import { defineDocumentType } from 'contentlayer/source-local/schema'

import { SEO } from '../nested/SEO'
import { urlFromFilePath } from '../utils'

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
    seo: SEO,
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
