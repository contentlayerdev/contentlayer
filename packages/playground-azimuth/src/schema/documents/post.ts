import { defineDocument } from '@sourcebit/sdk'
import { person } from './person'

export const post = defineDocument({
  name: 'post',
  // urlPath: '/blog/{slug}',
  label: 'Post',
  // layout: 'post',
  // folder: 'blog',
  filePathPattern: `content/pages/blog/**/*.md`,
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Title',
      description: 'The title of the post',
      required: true,
    },
    {
      type: 'string',
      name: 'subtitle',
      label: 'Subtitle',
      description: 'The text shown just below the title or the featured image',
    },
    {
      type: 'date',
      name: 'date',
      label: 'Date',
      required: true,
    },
    {
      type: 'reference',
      name: 'author',
      description: 'Post author',
      document: person,
    },
    {
      type: 'string',
      name: 'excerpt',
      label: 'Excerpt',
      description: 'The excerpt of the post displayed in the blog feed',
    },
    {
      type: 'image',
      name: 'image',
      label: 'Image (single post)',
      description: 'The image shown below the title',
    },
    {
      type: 'string',
      name: 'image_alt',
      label: 'Image alt text (single post)',
      description: 'The alt text of the featured image',
    },
    {
      type: 'image',
      name: 'thumb_image',
      label: 'Image (blog feed)',
      description: 'The image shown in the blog feed',
    },
    {
      type: 'string',
      name: 'thumb_image_alt',
      label: 'Image alt text (blog feed)',
      description: 'The alt text of the blog feed image',
    },
    {
      type: 'string',
      name: 'meta_title',
      label: 'Meta title',
      description:
        'The meta title of the post (recommended length is 50–60 characters)',
    },
    {
      type: 'string',
      name: 'meta_description',
      label: 'Meta description',
      description:
        'The meta description of the post (recommended length is 50–160 characters)',
    },
    {
      type: 'string',
      name: 'canonical_url',
      label: 'Canonical URL',
      description: 'The canonical url of the post',
    },
    {
      type: 'boolean',
      name: 'no_index',
      label: 'No Index',
      default: false,
      description: 'Tell search engines not to index this post',
    },
  ],
})
