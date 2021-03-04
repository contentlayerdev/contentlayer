import { defineDocument, defineObject } from '@sourcebit/sdk'
import { urlFromFilePath } from '../../utils/url'
import { action } from '../objects/action'
import { form_field } from '../objects/form_field'

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
      description: 'The meta title of the page (recommended length is 50–60 characters)',
    },
    {
      type: 'string',
      name: 'meta_description',
      label: 'Meta Description',
      description: 'The meta description of the page (recommended length is 50–160 characters)',
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
        object: () => [
          section_content,
          section_cta,
          section_hero,
          section_features,
          section_contact,
          section_faq,
          section_posts,
          section_pricing,
          section_reviews,
        ],
      },
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

const sectionBaseFields = [
  {
    type: 'string',
    name: 'section_id',
    label: 'Section ID',
    description: 'A unique identifier of the section, must not contain whitespace',
  },
  {
    type: 'string',
    name: 'title',
    label: 'Title',
    description: 'The title of the section',
  },
  // TODO move into SDK
  {
    type: 'string',
    name: 'type',
    label: 'Section type',
    required: true,
    description: 'Needed for sourcebit for polymorphic list types',
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

const section_hero = defineObject({
  name: 'section_hero',
  label: 'Hero Section',
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
      type: 'list',
      name: 'actions',
      label: 'Action Buttons',
      items: { type: 'object', object: action },
    },
  ],
})

const section_features = defineObject({
  name: 'section_features',
  label: 'Features Section',
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
      type: 'enum',
      name: 'background',
      label: 'Background',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
    {
      type: 'list',
      name: 'features',
      label: 'Features',
      items: { type: 'object', object: () => section_feature },
    },
  ],
})

const section_feature = defineObject({
  name: 'section_feature',
  label: 'Hero Section',
  labelField: 'title',
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Title',
    },
    {
      type: 'markdown',
      name: 'content',
      label: 'Content',
      description: 'Feature description',
    },
    {
      type: 'image',
      name: 'image',
      label: 'Image',
      description: 'Feature image',
    },
    {
      type: 'string',
      name: 'image_alt',
      label: 'Image Alt Text',
      description: 'The alt text of the feature image',
    },
    {
      type: 'list',
      name: 'actions',
      label: 'Action Buttons',
      items: { type: 'object', object: action },
    },
  ],
})

const section_contact = defineObject({
  name: 'section_contact',
  label: 'Contact Section',
  labelField: 'title',
  fields: [
    ...sectionBaseFields,
    {
      type: 'string',
      name: 'subtitle',
      label: 'Subtitle',
      description: 'The text shown below the title',
    },
    {
      type: 'markdown',
      name: 'content',
      label: 'Content',
      description: 'the content of the section, appears above the form',
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
      type: 'string',
      name: 'form_id',
      label: 'Form ID',
      description: 'A unique identifier of the form, must not contain whitespace',
      required: true,
    },
    {
      type: 'string',
      name: 'form_action',
      label: 'Form Action',
      description: 'The path of your custom "success" page, if you want to replace the default success message.',
    },
    {
      type: 'boolean',
      name: 'hide_labels',
      label: 'Hide labels of the form fields?',
      default: false,
    },
    {
      type: 'list',
      name: 'form_fields',
      label: 'Form Fields',
      items: { type: 'object', object: form_field },
    },
    {
      type: 'string',
      name: 'submit_label',
      label: 'Submit Button Label',
      required: true,
    },
  ],
})

const section_faq = defineObject({
  name: 'section_faq',
  label: 'Contact Section',
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
      type: 'enum',
      name: 'background',
      label: 'Background',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
    {
      type: 'list',
      name: 'faq_items',
      label: 'FAQ Items',
      items: { type: 'object', object: () => faq_item },
    },
  ],
})

const faq_item = defineObject({
  name: 'faq_item',
  label: 'FAQ Item',
  fields: [
    {
      type: 'text',
      name: 'question',
      label: 'Question',
    },
    {
      type: 'markdown',
      name: 'answer',
      label: 'Answer',
    },
  ],
})

const section_posts = defineObject({
  name: 'section_posts',
  label: 'Posts List',
  fields: [
    ...sectionBaseFields,
    {
      type: 'string',
      name: 'subtitle',
      label: 'Subtitle',
      description: 'The subtitle of the section',
    },
    {
      type: 'enum',
      name: 'background',
      label: 'Background',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
  ],
})

const section_pricing = defineObject({
  name: 'section_pricing',
  label: 'Pricing Section',
  fields: [
    ...sectionBaseFields,
    {
      type: 'string',
      name: 'subtitle',
      label: 'Subtitle',
      description: 'The subtitle of the section',
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
      name: 'pricing_plans',
      label: 'Pricing Plans',
      items: { type: 'object', object: () => pricing_plan },
    },
  ],
})

const pricing_plan = defineObject({
  name: 'pricing_plan',
  label: 'Pricing Plan',
  labelField: 'title',
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Title',
    },
    {
      type: 'string',
      name: 'subtitle',
      label: 'Subtitle',
    },
    {
      type: 'string',
      name: 'price',
      label: 'Price',
    },
    {
      type: 'markdown',
      name: 'details',
      label: 'Details',
    },
    {
      type: 'boolean',
      name: 'highlight',
      label: 'Highlight',
      description: 'Make the plan stand out by adding a distinctive style',
      default: false,
    },
    {
      type: 'list',
      name: 'actions',
      label: 'Action Buttons',
      items: { type: 'object', object: action },
    },
  ],
})

const section_reviews = defineObject({
  name: 'section_reviews',
  label: 'Reviews Section',
  fields: [
    ...sectionBaseFields,
    {
      type: 'string',
      name: 'subtitle',
      label: 'Subtitle',
      description: 'The subtitle of the section',
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
      name: 'reviews',
      label: 'Reviews',
      items: { type: 'object', object: () => review_item },
    },
  ],
})

const review_item = defineObject({
  name: 'review_item',
  label: 'Review Item',
  labelField: 'title',
  fields: [
    {
      type: 'string',
      name: 'author',
      label: 'Author',
    },
    {
      type: 'image',
      name: 'avatar',
      label: 'Avatar',
    },
    {
      type: 'text',
      name: 'content',
      label: 'Content',
    },
  ],
})
