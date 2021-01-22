import { defineDocument } from '../../../../lib/schema'

export const blog = defineDocument({
  name: 'blog',
  // urlPath: '/blog',
  label: 'Blog',
  // layout: 'blog',
  // file: 'blog/index.md',
  // hideContent: true,
  // singleInstance: true,
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
      description:
        'The meta title of the page (recommended length is 50–60 characters)',
    },
    {
      type: 'string',
      name: 'meta_description',
      label: 'Meta Description',
      description:
        'The meta description of the page (recommended length is 50–160 characters)',
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
})
