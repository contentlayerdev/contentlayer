import { defineDocument } from '../../../../lib/schema'

export const page = defineDocument({
  name: 'page',
  label: 'Page',
  // layout: 'page',
  // exclude: 'blog/**',
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
      name: 'subtitle',
      label: 'Subtitle',
      description: 'The text shown below the page title',
    },
    {
      type: 'image',
      name: 'image',
      label: 'Image',
      description: 'The image shown below the page title',
    },
    {
      type: 'string',
      name: 'image_alt',
      label: 'Image Alt Text',
      description: 'The alt text of the image',
    },
    {
      type: 'string',
      name: 'meta_title',
      label: 'Meta title',
      description:
        'The meta title of the page (recommended length is 50–60 characters)',
    },
    {
      type: 'string',
      name: 'meta_description',
      label: 'Meta description',
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
