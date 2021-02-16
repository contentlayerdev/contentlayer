import { defineDocument, defineObject } from '@sourcebit/sdk'
import { action } from '../objects/action'

export const landing = defineDocument({
  name: 'landing',
  label: 'Landing Page',
  // layout: 'landing',
  // hideContent: true,
  filePathPattern: 'content/pages/{contact,features,index,pricing}.md',
  urlPath: '/',
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
    {
      type: 'list',
      name: 'sections',
      label: 'Sections',
      description: 'Page sections',
      items: {
        type: 'object',
        labelField: 'title',
        object: () => [section_content, section_cta],
        // models: [
        //   section_content,
        //   'section_cta',
        //   'section_faq',
        //   'section_features',
        //   'section_hero',
        //   'section_posts',
        //   'section_pricing',
        //   'section_reviews',
        //   'section_contact',
        // ],
      },
    },
  ],
})

const sectionBaseFields = [
  {
    type: 'string',
    name: 'section_id',
    label: 'Section ID',
    description:
      'A unique identifier of the section, must not contain whitespace',
  },
  {
    type: 'string',
    name: 'title',
    label: 'Title',
    description: 'The title of the section',
  },
] as const

const section_content = defineObject({
  name: 'section_content',
  label: 'Content Section',
  // extends: ['section'],
  labelField: 'title',
  fields: [
    ...sectionBaseFields,
    {
      type: 'markdown',
      name: 'content',
      label: 'Content',
      description: 'The text content of the section',
    },
    {
      type: 'image',
      name: 'image',
      label: 'Image',
      description: 'The image of the section',
    },
    {
      type: 'string',
      name: 'image_alt',
      label: 'Image Alt Text',
      description: 'The alt text of the section image',
    },
    {
      type: 'enum',
      name: 'background',
      label: 'Background',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
    {
      type: 'list',
      name: 'actions',
      label: 'Action Buttons',
      items: { type: 'object', object: action },
    },
  ],
})

const section_cta = defineObject({
  name: 'section_cta',
  label: 'Call to Action Section',
  labelField: 'title',
  fields: [
    ...sectionBaseFields,
    {
      type: 'string',
      name: 'subtitle',
      label: 'Subtitle',
      description: 'The subtitle of the section',
    },
    {
      type: 'list',
      name: 'actions',
      label: 'Action Buttons',
      items: { type: 'object', object: action },
    },
  ],
})
