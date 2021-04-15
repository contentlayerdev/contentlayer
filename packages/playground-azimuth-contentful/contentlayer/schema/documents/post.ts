import { defineDocument } from 'contentlayer/source-local'
import { seo } from '../objects/seo'
import { urlFromFilePath } from '../utils'
import { person } from './person'

export const post = defineDocument(() => ({
  name: 'post',
  label: 'Post',
  filePathPattern: `pages/blog/**/*.md`,
  fields: {
    title: {
      type: 'string',
      label: 'Title',
      description: 'The title of the post',
      required: true,
    },
    subtitle: {
      type: 'string',
      label: 'Subtitle',
      description: 'The text shown just below the title or the featured image',
    },
    date: {
      type: 'date',
      label: 'Date',
      required: true,
    },
    author: {
      type: 'reference',
      description: 'Post author',
      document: person,
    },
    excerpt: {
      type: 'string',
      label: 'Excerpt',
      description: 'The excerpt of the post displayed in the blog feed',
    },
    image: {
      type: 'image',
      label: 'Image (single post)',
      description: 'The image shown below the title',
    },
    image_alt: {
      type: 'string',
      label: 'Image alt text (single post)',
      description: 'The alt text of the featured image',
    },
    thumb_image: {
      type: 'image',
      label: 'Image (blog feed)',
      description: 'The image shown in the blog feed',
    },
    thumb_image_alt: {
      type: 'string',
      label: 'Image alt text (blog feed)',
      description: 'The alt text of the blog feed image',
    },
    seo: {
      type: 'object',
      object: seo,
    },
    content: {
      type: 'markdown',
      label: 'Page content',
      description: 'Page content',
      required: false,
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
