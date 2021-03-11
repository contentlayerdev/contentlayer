import { defineDocument } from '@sourcebit/source-local'
import { stackbit_page_meta } from '../objects/stackbit_page_meta'
import { urlFromFilePath } from '../utils'

export const page = defineDocument({
  name: 'page',
  label: 'Page',
  filePathPattern: 'content/pages/{about,privacy-policy,signup,style-guide,terms-of-service}.md',
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
