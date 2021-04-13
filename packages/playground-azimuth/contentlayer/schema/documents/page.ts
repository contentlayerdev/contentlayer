import { defineDocument } from 'contentlayer/source-local'
import { seo } from '../objects/seo'
import { urlFromFilePath } from '../utils'

export const page = defineDocument(() => ({
  name: 'page',
  label: 'Page',
  filePathPattern: 'pages/{about,privacy-policy,signup,style-guide,terms-of-service}.md',
  fields: {
    title: {
      type: 'string',
      label: 'Title',
      description: 'The title of the page',
      required: true,
    },
    subtitle: {
      type: 'string',
      label: 'Subtitle',
      description: 'The text shown below the page title',
    },
    image: {
      type: 'image',
      label: 'Image',
      description: 'The image shown below the page title',
    },
    image_alt: {
      type: 'string',
      label: 'Image Alt Text',
      description: 'The alt text of the image',
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
