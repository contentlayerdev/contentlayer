import { defineDocument } from '@sourcebit/source-local'
import { stackbit_page_meta } from '../objects/stackbit_page_meta'
import { urlFromFilePath } from '../utils'
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
      type: 'object',
      name: 'seo',
      object: stackbit_page_meta,
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
