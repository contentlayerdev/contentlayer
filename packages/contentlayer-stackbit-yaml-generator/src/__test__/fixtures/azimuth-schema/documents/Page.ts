import { defineDocumentType } from 'contentlayer2/source-files'

import { SEO } from '../nested/SEO.js'
import { urlFromFilePath } from '../utils.js'

export const Page = defineDocumentType(() => ({
  name: 'Page',
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
      type: 'string',
      label: 'Image',
      description: 'The image shown below the page title',
    },
    image_alt: {
      type: 'string',
      label: 'Image Alt Text',
      description: 'The alt text of the image',
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
    stackbit: { match: ['about.md', 'privacy-policy.md', 'signup.md', 'style-guide.md', 'terms-of-service.md'] },
  },
}))
