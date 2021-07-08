import { defineDocument, defineObject } from 'contentlayer/source-local'

import { Action } from '../objects/Action'
import { FormField } from '../objects/FormField'
import { SEO } from '../objects/SEO'
import { urlFromFilePath } from '../utils'

export const Landing = defineDocument(() => ({
  name: 'Landing',
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
        { type: 'object', labelField: 'title', object: SectionContent },
        { type: 'object', labelField: 'title', object: SectionCta },
        { type: 'object', labelField: 'title', object: SectionFaq },
        { type: 'object', labelField: 'title', object: SectionFeatures },
        { type: 'object', labelField: 'title', object: SectionHero },
        { type: 'object', labelField: 'title', object: SectionPosts },
        { type: 'object', labelField: 'title', object: SectionPricing },
        { type: 'object', labelField: 'title', object: SectionReviews },
        { type: 'object', labelField: 'title', object: SectionContact },
      ],
      typeField: 'type',
    },
    seo: {
      type: 'object',
      object: SEO,
    },
  },
  computedFields: {
    url_path: {
      type: 'string',
      description:
        'The URL path of this page relative to site root. For example, the site root page would be "/", and post page would be "posts/new-post/"',
      resolve: urlFromFilePath,
    },
  },
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

const SectionContent = defineObject(() => ({
  name: 'SectionContent',
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
      of: { type: 'object', object: Action },
    },
  },
}))

const SectionCta = defineObject(() => ({
  name: 'SectionCta',
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
      of: { type: 'object', object: Action },
    },
  },
}))

const SectionHero = defineObject(() => ({
  name: 'SectionHero',
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
      of: { type: 'object', object: Action },
    },
  },
}))

const SectionFeatures = defineObject(() => ({
  name: 'SectionFeatures',
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
      of: { type: 'object', object: FeatureItem },
    },
  },
}))

const FeatureItem = defineObject(() => ({
  name: 'FeatureItem',
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
      of: { type: 'object', object: Action },
    },
  },
}))

const SectionContact = defineObject(() => ({
  name: 'SectionContact',
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
      of: { type: 'object', object: FormField },
    },
    submit_label: {
      type: 'string',
      label: 'Submit Button Label',
      required: true,
    },
  },
}))

const SectionFaq = defineObject(() => ({
  name: 'SectionFaq',
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
      of: { type: 'object', object: FaqItem },
    },
  },
}))

const FaqItem = defineObject(() => ({
  name: 'FaqItem',
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

const SectionPosts = defineObject(() => ({
  name: 'SectionPosts',
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

const SectionPricing = defineObject(() => ({
  name: 'SectionPricing',
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
      of: { type: 'object', object: PricingPlan },
    },
  },
}))

const PricingPlan = defineObject(() => ({
  name: 'PricingPlan',
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
      of: { type: 'object', object: Action },
    },
  },
}))

const SectionReviews = defineObject(() => ({
  name: 'SectionReviews',
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
      of: { type: 'object', object: ReviewItem },
    },
  },
}))

const ReviewItem = defineObject(() => ({
  name: 'ReviewItem',
  label: 'Review Item',
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
