import { defineDocument } from '@sourcebit/sdk'
import { urlFromFilePath } from '../../utils/url'
// import { sluggify } from '../../../../lib/utils'

export const blog = defineDocument({
  name: 'blog',
  // urlPath: '/blog',
  label: 'Blog',
  // layout: 'blog',
  // file: 'blog/index.md',
  // hideContent: true,
  // singleInstance: true,
  // urlPath: (doc) => `/blog/${sluggify(doc.title)}`,
  filePathPattern: `content/pages/blog/index.md`,
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Title',
      description: 'The title of the page',
      required: true,
    },
    {
      type: 'string',
      name: 'meta_title',
      label: 'Meta Title',
      description: 'The meta title of the page (recommended length is 50–60 characters)',
    },
    {
      type: 'string',
      name: 'meta_description',
      label: 'Meta Description',
      description: 'The meta description of the page (recommended length is 50–160 characters)',
    },
    {
      type: 'string',
      name: 'canonical_url',
      label: 'Canonical URL',
      description: 'The canonical url of the page',
    },
    {
      type: 'boolean',
      name: 'no_index',
      label: 'No Index',
      default: false,
      description: 'Tell search engines not to index this page',
    },
  ],
  computedFields: (defineField) => [
    defineField({
      name: 'urlPath',
      type: 'string',
      resolve: urlFromFilePath,
    }),
  ],
})
