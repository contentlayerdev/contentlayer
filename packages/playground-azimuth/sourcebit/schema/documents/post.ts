import { defineDocument } from '@sourcebit/source-local'
import { stackbit_page_meta } from '../objects/stackbit_page_meta'
import { urlFromFilePath } from '../utils'
import { person } from './person'

export const post = defineDocument({
  name: 'post',
  label: 'Post',
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
      type: 'object',
      name: 'seo',
      object: stackbit_page_meta,
    },
    {
      type: 'markdown',
      name: 'content',
      label: 'Page content',
      description: 'Page content',
      required: false,
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
