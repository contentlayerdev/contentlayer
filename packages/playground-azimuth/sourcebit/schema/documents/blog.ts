import { defineDocument } from '@sourcebit/source-local'
import { seo } from '../objects/seo'
import { urlFromFilePath } from '../utils'
// import { sluggify } from '../../../../lib/utils'

export const blog = defineDocument(() => ({
  name: 'blog',
  // urlPath: '/blog',
  label: 'Blog',
  // file: 'blog/index.md',
  // hideContent: true,
  // singleInstance: true,
  // urlPath: (doc) => `/blog/${sluggify(doc.title)}`,
  filePathPattern: `pages/blog.md`,
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
  computedFields: (defineField) => [
    defineField({
      name: 'url_path',
      description:
        'The URL path of this page relative to site root. For example, the site root page would be "/", and post page would be "posts/new-post/"',
      type: 'string',
      resolve: urlFromFilePath,
    }),
  ],
}))
