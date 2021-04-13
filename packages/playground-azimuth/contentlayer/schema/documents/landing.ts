import { defineDocument, defineObject } from 'contentlayer/source-local'
import { action } from '../objects/action'
import { form_field } from '../objects/form_field'
import { seo } from '../objects/seo'
import { urlFromFilePath } from '../utils'

export const landing = defineDocument(() => ({
  name: 'landing',
  label: 'Landing Page',
  filePathPattern: 'pages/{contact,features,index,pricing}.md',
  fields: {
    title: {
      type: 'string',
      label: 'Title',
      description: 'The title of the page',
      required: true,
    },
    sections: {
      type: 'polymorphic_list',
      label: 'Sections',
      description: 'Page sections',
      of: [
        { type: 'object', labelField: 'title', object: section_content },
        { type: 'object', labelField: 'title', object: section_cta },
        { type: 'object', labelField: 'title', object: section_faq },
        { type: 'object', labelField: 'title', object: section_features },
        { type: 'object', labelField: 'title', object: section_hero },
        { type: 'object', labelField: 'title', object: section_posts },
        { type: 'object', labelField: 'title', object: section_pricing },
        { type: 'object', labelField: 'title', object: section_reviews },
        { type: 'object', labelField: 'title', object: section_contact },
      ],
      typeField: 'type',
    },
    seo: {
      type: 'object',
      object: seo,
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

const sectionBaseFields = {
  section_id: {
    type: 'string',
    label: 'Section ID',
    description: 'A unique identifier of the section, must not contain whitespace',
  },
  title: {
    type: 'string',
    label: 'Title',
    description: 'The title of the section',
  },
  type: {
    type: 'string',
    label: 'Section type',
    required: true,
    description: 'Needed for contentlayer for polymorphic list types',
  },
} as const

const section_content = defineObject(() => ({
  name: 'section_content',
  label: 'Content Section',
  labelField: 'title',
  fields: {
    ...sectionBaseFields,
    content: {
      type: 'markdown',
      label: 'Content',
      description: 'The text content of the section',
    },
    image: {
      type: 'image',
      label: 'Image',
      description: 'The image of the section',
    },
    image_alt: {
      type: 'string',
      label: 'Image Alt Text',
      description: 'The alt text of the section image',
    },
    background: {
      type: 'enum',
      label: 'Background',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
    actions: {
      type: 'list',
      label: 'Action Buttons',
      of: { type: 'object', object: action },
    },
  },
}))

const section_cta = defineObject(() => ({
  name: 'section_cta',
  label: 'Call to Action Section',
  labelField: 'title',
  fields: {
    ...sectionBaseFields,
    subtitle: {
      type: 'string',
      label: 'Subtitle',
      description: 'The subtitle of the section',
    },
    actions: {
      type: 'list',
      label: 'Action Buttons',
      of: { type: 'object', object: action },
    },
  },
}))

const section_hero = defineObject(() => ({
  name: 'section_hero',
  label: 'Hero Section',
  labelField: 'title',
  fields: {
    ...sectionBaseFields,
    content: {
      type: 'markdown',
      label: 'Content',
      description: 'The text content of the section',
    },
    image: {
      type: 'image',
      label: 'Image',
      description: 'The image of the section',
    },
    image_alt: {
      type: 'string',
      label: 'Image Alt Text',
      description: 'The alt text of the section image',
    },
    actions: {
      type: 'list',
      label: 'Action Buttons',
      of: { type: 'object', object: action },
    },
  },
}))

const section_features = defineObject(() => ({
  name: 'section_features',
  label: 'Features Section',
  labelField: 'title',
  fields: {
    ...sectionBaseFields,
    subtitle: {
      type: 'string',
      label: 'Subtitle',
      description: 'The subtitle of the section',
    },
    background: {
      type: 'enum',
      label: 'Background',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
    features: {
      type: 'list',
      label: 'Features',
      of: { type: 'object', object: feature_item },
    },
  },
}))

const feature_item = defineObject(() => ({
  name: 'feature_item',
  label: 'Feature Item',
  labelField: 'title',
  fields: {
    title: {
      type: 'string',
      label: 'Title',
    },
    content: {
      type: 'markdown',
      label: 'Content',
      description: 'Feature description',
    },
    image: {
      type: 'image',
      label: 'Image',
      description: 'Feature image',
    },
    image_alt: {
      type: 'string',
      label: 'Image Alt Text',
      description: 'The alt text of the feature image',
    },
    actions: {
      type: 'list',
      label: 'Action Buttons',
      of: { type: 'object', object: action },
    },
  },
}))

const section_contact = defineObject(() => ({
  name: 'section_contact',
  label: 'Contact Section',
  labelField: 'title',
  fields: {
    ...sectionBaseFields,
    subtitle: {
      type: 'string',
      label: 'Subtitle',
      description: 'The text shown below the title',
    },
    content: {
      type: 'markdown',
      label: 'Content',
      description: 'the content of the section, appears above the form',
    },
    background: {
      type: 'enum',
      label: 'Background',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
    form_id: {
      type: 'string',
      label: 'Form ID',
      description: 'A unique identifier of the form, must not contain whitespace',
      required: true,
    },
    form_action: {
      type: 'string',
      label: 'Form Action',
      description: 'The path of your custom "success" page, if you want to replace the default success message.',
    },
    hide_labels: {
      type: 'boolean',
      label: 'Hide labels of the form fields?',
      default: false,
    },
    form_fields: {
      type: 'list',
      label: 'Form Fields',
      of: { type: 'object', object: form_field },
    },
    submit_label: {
      type: 'string',
      label: 'Submit Button Label',
      required: true,
    },
  },
}))

const section_faq = defineObject(() => ({
  name: 'section_faq',
  label: 'FAQ Section',
  labelField: 'title',
  fields: {
    ...sectionBaseFields,
    subtitle: {
      type: 'string',
      label: 'Subtitle',
      description: 'The subtitle of the section',
    },
    background: {
      type: 'enum',
      label: 'Background',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
    faq_items: {
      type: 'list',
      label: 'FAQ Items',
      of: { type: 'object', object: faq_item },
    },
  },
}))

const faq_item = defineObject(() => ({
  name: 'faq_item',
  label: 'FAQ Item',
  fields: {
    question: {
      type: 'text',
      label: 'Question',
    },
    answer: {
      type: 'markdown',
      label: 'Answer',
    },
  },
}))

const section_posts = defineObject(() => ({
  name: 'section_posts',
  label: 'Posts List',
  fields: {
    ...sectionBaseFields,
    subtitle: {
      type: 'string',
      label: 'Subtitle',
      description: 'The subtitle of the section',
    },
    background: {
      type: 'enum',
      label: 'Background',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
  },
}))

const section_pricing = defineObject(() => ({
  name: 'section_pricing',
  label: 'Pricing Section',
  fields: {
    ...sectionBaseFields,
    subtitle: {
      type: 'string',
      label: 'Subtitle',
      description: 'The subtitle of the section',
    },
    background: {
      type: 'enum',
      label: 'Background',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
    pricing_plans: {
      type: 'list',
      label: 'Pricing Plans',
      of: { type: 'object', object: pricing_plan },
    },
  },
}))

const pricing_plan = defineObject(() => ({
  name: 'pricing_plan',
  label: 'Pricing Plan',
  labelField: 'title',
  fields: {
    title: {
      type: 'string',
      label: 'Title',
    },
    subtitle: {
      type: 'string',
      label: 'Subtitle',
    },
    price: {
      type: 'string',
      label: 'Price',
    },
    details: {
      type: 'markdown',
      label: 'Details',
    },
    highlight: {
      type: 'boolean',
      label: 'Highlight',
      description: 'Make the plan stand out by adding a distinctive style',
      default: false,
    },
    actions: {
      type: 'list',
      label: 'Action Buttons',
      of: { type: 'object', object: action },
    },
  },
}))

const section_reviews = defineObject(() => ({
  name: 'section_reviews',
  label: 'Reviews Section',
  fields: {
    ...sectionBaseFields,
    subtitle: {
      type: 'string',
      label: 'Subtitle',
      description: 'The subtitle of the section',
    },
    background: {
      type: 'enum',
      label: 'Background',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
    reviews: {
      type: 'list',
      label: 'Reviews',
      of: { type: 'object', object: review_item },
    },
  },
}))

const review_item = defineObject(() => ({
  name: 'review_item',
  label: 'Review Item',
  labelField: 'title',
  fields: {
    author: {
      type: 'string',
      label: 'Author',
    },
    avatar: {
      type: 'image',
      label: 'Author Image',
    },
    avatar_alt: {
      type: 'string',
      label: 'Author Image Alt Text',
    },
    content: {
      type: 'text',
      label: 'Content',
    },
  },
}))
