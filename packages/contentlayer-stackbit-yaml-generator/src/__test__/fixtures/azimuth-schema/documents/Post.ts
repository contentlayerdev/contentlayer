import { defineDocumentType } from 'contentlayer2/source-files'

import { SEO } from '../nested/SEO.js'
import { urlFromFilePath } from '../utils.js'
import { Person } from './Person.js'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `pages/blog/**/*.md`,
  fields: {
    title: {
      type: 'string',
      description: 'The title of the post',
      required: true,
    },
    subtitle: {
      type: 'string',
      description: 'The text shown just below the title or the featured image',
    },
    date: {
      type: 'date',
      required: true,
    },
    author: {
      type: 'reference',
      of: Person,
      description: 'Post author',
    },
    excerpt: {
      type: 'string',
      description: 'The excerpt of the post displayed in the blog feed',
    },
    image: {
      type: 'string',
      description: 'The image shown below the title',
    },
    image_alt: {
      type: 'string',
      description: 'The alt text of the featured image',
    },
    thumb_image: {
      type: 'string',
      description: 'The image shown in the blog feed',
    },
    thumb_image_alt: {
      type: 'string',
      description: 'The alt text of the blog feed image',
    },
    seo: { type: 'nested', of: SEO },
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
        subtitle: { label: 'Subtitle' },
        date: { label: 'Date' },
        excerpt: { label: 'Excerpt' },
        image: { label: 'Image' },
        image_alt: { label: 'Image alt text (single post)' },
        thumb_image: { label: 'Image (blog feed)' },
        thumb_image_alt: { label: 'Image alt text (blog feed)' },
      },
      match: 'blog/**.md',
    },
  },
}))
