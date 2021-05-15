import { defineDocument } from 'contentlayer/source-local'
import { seo } from '../objects/seo'
import { urlFromFilePath } from '../utils'

export const blog = defineDocument(() => ({
  name: 'blog',
  label: 'Blog',
  filePathPattern: `pages/blog.md`,
  fileType: 'md',
  isSingleton: true,
  fields: {
    title: {
      type: 'string',
      label: 'Title',
      description: 'The title of the page',
      required: true,
    },
    seo: {
      type: 'object',
      object: seo,
    },
  },
  computedFields: {
    url_path: {
      type: 'string',
      description:
        'The URL path of this page relative to site root. For example, the site root page would be "/", and post page would be "posts/new-post/"',
      resolve: urlFromFilePath,
    },
  },
}))
