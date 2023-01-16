import { defineDocumentType, defineFields, defineNestedType } from 'contentlayer/source-files'

import { Action } from '../nested/Action.js'
import { FormField } from '../nested/FormField.js'
import { SEO } from '../nested/SEO.js'
import { urlFromFilePath } from '../utils.js'

export const Landing = defineDocumentType(() => ({
  name: 'Landing',
  filePathPattern: 'pages/{contact,features,index,pricing}.md',
  fields: {
    title: {
      type: 'string',
      description: 'The title of the page',
      required: true,
    },
    sections: {
      type: 'list',
      description: 'Page sections',
      of: [
        SectionContent,
        SectionCta,
        SectionFaq,
        SectionFeatures,
        SectionHero,
        SectionPosts,
        SectionPricing,
        SectionReviews,
        SectionContact,
      ],
      typeField: 'type',
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
      label: 'Landing Page',
      fields: {
        title: { label: 'Title' },
        sections: { label: 'Sections' },
      },
      match: ['contact.md', 'features.md', 'index.md', 'pricing.md'],
    },
  },
}))

const sectionBaseFields = defineFields({
  section_id: {
    type: 'string',
    description: 'A unique identifier of the section, must not contain whitespace',
  },
  title: {
    type: 'string',
    description: 'The title of the section',
  },
  type: {
    type: 'string',
    required: true,
    description: 'Needed for contentlayer for polymorphic list types',
  },
})

const sectionBaseFieldsExtension = {
  section_id: { label: 'Section ID' },
  title: { label: 'Title' },
  type: { label: 'Section type' },
} as const

const SectionContent = defineNestedType(() => ({
  name: 'SectionContent',
  fields: {
    ...sectionBaseFields,
    content: {
      type: 'markdown',
      description: 'The text content of the section',
    },
    image: {
      type: 'string',
      description: 'The image of the section',
    },
    image_alt: {
      type: 'string',
      description: 'The alt text of the section image',
    },
    background: {
      type: 'enum',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
    actions: {
      type: 'list',
      of: Action,
    },
  },
  extensions: {
    stackbit: {
      label: 'Content Section',
      labelField: 'title',
      fieldGroups: [
        { name: 'content', label: 'Content' },
        { name: 'design', label: 'Design' },
      ],
      fields: {
        ...sectionBaseFieldsExtension,
        content: { label: 'Content', group: 'content' },
        image: { label: 'Image', group: 'content', control: { type: 'image-gallery', options: {} } },
        image_alt: { label: 'Image Alt Text', group: 'content' },
        background: { label: 'Background', group: 'design', control: { type: 'image-gallery', options: {} } },
        actions: { label: 'Action Buttons' },
      },
    },
  },
}))

const SectionCta = defineNestedType(() => ({
  name: 'SectionCta',
  fields: {
    ...sectionBaseFields,
    subtitle: {
      type: 'string',
      description: 'The subtitle of the section',
    },
    actions: {
      type: 'list',
      of: Action,
    },
  },
  extensions: {
    stackbit: {
      label: 'Call to Action Section',
      labelField: 'title',
      fields: {
        ...sectionBaseFieldsExtension,
        subtitle: { label: 'Subtitle' },
        actions: { label: 'Action Buttons' },
      },
    },
  },
}))

const SectionHero = defineNestedType(() => ({
  name: 'SectionHero',
  fields: {
    ...sectionBaseFields,
    content: {
      type: 'markdown',
      description: 'The text content of the section',
    },
    image: {
      type: 'string',
      description: 'The image of the section',
    },
    image_alt: {
      type: 'string',
      description: 'The alt text of the section image',
    },
    actions: {
      type: 'list',
      of: Action,
    },
  },
  extensions: {
    stackbit: {
      label: 'Hero Section',
      labelField: 'title',
      fields: {
        ...sectionBaseFieldsExtension,
        content: { label: 'Content' },
        image: { label: 'Image', control: { type: 'image-gallery', options: {} } },
        image_alt: { label: 'Image Alt Text' },
        actions: { label: 'Action Buttons' },
      },
    },
  },
}))

const SectionFeatures = defineNestedType(() => ({
  name: 'SectionFeatures',
  fields: {
    ...sectionBaseFields,
    subtitle: {
      type: 'string',
      description: 'The subtitle of the section',
    },
    background: {
      type: 'enum',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
    features: {
      type: 'list',
      of: FeatureItem,
    },
  },
  extensions: {
    stackbit: {
      label: 'Features Section',
      labelField: 'title',
      fields: {
        ...sectionBaseFieldsExtension,
        subtitle: { label: 'Subtitle' },
        background: { label: 'Background' },
        features: { label: 'Features' },
      },
    },
  },
}))

const FeatureItem = defineNestedType(() => ({
  name: 'FeatureItem',
  fields: {
    title: { type: 'string' },
    content: {
      type: 'markdown',
      description: 'Feature description',
    },
    image: {
      type: 'string',
      description: 'Feature image',
    },
    image_alt: {
      type: 'string',
      description: 'The alt text of the feature image',
    },
    actions: {
      type: 'list',
      of: Action,
    },
  },
  extensions: {
    stackbit: {
      label: 'Feature Item',
      labelField: 'title',
      fields: {
        title: { label: 'Title' },
        content: { label: 'Content' },
        image: { label: 'Image', control: { type: 'image-gallery', options: {} } },
        image_alt: { label: 'Image Alt Text' },
        actions: { label: 'Action Buttons' },
      },
    },
  },
}))

const SectionContact = defineNestedType(() => ({
  name: 'SectionContact',
  fields: {
    ...sectionBaseFields,
    subtitle: {
      type: 'string',
      description: 'The text shown below the title',
    },
    content: {
      type: 'markdown',
      description: 'the content of the section, appears above the form',
    },
    background: {
      type: 'enum',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
    form_id: {
      type: 'string',
      description: 'A unique identifier of the form, must not contain whitespace',
      required: true,
    },
    form_action: {
      type: 'string',
      description:
        'The path of your custom "success" page, if you want to replace the default success message./index.js',
    },
    hide_labels: {
      type: 'boolean',
      default: false,
    },
    form_fields: {
      type: 'list',
      of: FormField,
    },
    submit_label: {
      type: 'string',
      required: true,
    },
  },
  extensions: {
    stackbit: {
      label: 'Contact Section',
      labelField: 'title',
      fields: {
        ...sectionBaseFieldsExtension,
        subtitle: { label: 'Subtitle' },
        content: { label: 'Content' },
        background: { label: 'Background' },
        form_id: { label: 'Form ID' },
        form_action: { label: 'Form Action' },
        hide_labels: { label: 'Hide labels of the form fields?' },
        form_fields: { label: 'Form Fields' },
        submit_label: { label: 'Submit Button Label' },
      },
    },
  },
}))

const SectionFaq = defineNestedType(() => ({
  name: 'SectionFaq',
  label: 'FAQ Section',
  labelField: 'title',
  fields: {
    ...sectionBaseFields,
    subtitle: {
      type: 'string',
      description: 'The subtitle of the section',
    },
    background: {
      type: 'enum',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
    faq_items: {
      type: 'list',
      of: FaqItem,
    },
  },
  extensions: {
    stackbit: {
      label: 'Contact Section',
      labelField: 'title',
      fields: {
        ...sectionBaseFieldsExtension,
        subtitle: { label: 'Subtitle' },
        background: { label: 'Background' },
        faq_items: { label: 'FAQ Items' },
      },
    },
  },
}))

const FaqItem = defineNestedType(() => ({
  name: 'FaqItem',
  fields: {
    question: { type: 'string' },
    answer: { type: 'markdown' },
  },
  extensions: {
    stackbit: {
      label: 'FAQ Item',
      fields: {
        question: { label: 'Question' },
        answer: { label: 'Answer' },
      },
    },
  },
}))

const SectionPosts = defineNestedType(() => ({
  name: 'SectionPosts',
  fields: {
    ...sectionBaseFields,
    subtitle: {
      type: 'string',
      description: 'The subtitle of the section',
    },
    background: {
      type: 'enum',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
  },
  extensions: {
    stackbit: {
      label: 'Posts List',
      fields: {
        ...sectionBaseFieldsExtension,
        subtitle: { label: 'Subtitle' },
        background: { label: 'Background' },
      },
    },
  },
}))

const SectionPricing = defineNestedType(() => ({
  name: 'SectionPricing',
  fields: {
    ...sectionBaseFields,
    subtitle: {
      type: 'string',
      description: 'The subtitle of the section',
    },
    background: {
      type: 'enum',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
    pricing_plans: {
      type: 'list',
      of: PricingPlan,
    },
  },
  extensions: {
    stackbit: {
      label: 'Pricing Section',
      fields: {
        ...sectionBaseFieldsExtension,
        subtitle: { label: 'Subtitle' },
        background: { label: 'Background' },
        pricing_plans: { label: 'Pricing Plans' },
      },
    },
  },
}))

const PricingPlan = defineNestedType(() => ({
  name: 'PricingPlan',
  fields: {
    title: {
      type: 'string',
    },
    subtitle: {
      type: 'string',
    },
    price: {
      type: 'string',
    },
    details: {
      type: 'markdown',
    },
    highlight: {
      type: 'boolean',
      description: 'Make the plan stand out by adding a distinctive style',
      default: false,
    },
    actions: {
      type: 'list',
      of: Action,
    },
  },
  extensions: {
    stackbit: {
      label: 'Pricing Plan',
      labelField: 'title',
      fields: {
        title: { label: 'Title' },
        subtitle: { label: 'Subtitle' },
        price: { label: 'Price' },
        details: { label: 'Details' },
        highlight: { label: 'Highlight' },
        actions: { label: 'Action Buttons' },
      },
    },
  },
}))

const SectionReviews = defineNestedType(() => ({
  name: 'SectionReviews',
  fields: {
    ...sectionBaseFields,
    subtitle: {
      type: 'string',
      description: 'The subtitle of the section',
    },
    background: {
      type: 'enum',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
    reviews: {
      type: 'list',
      of: ReviewItem,
    },
  },
  extensions: {
    stackbit: {
      label: 'Reviews Section',
      fields: {
        ...sectionBaseFieldsExtension,
        subtitle: { label: 'Subtitle' },
        background: { label: 'Background' },
        reviews: { label: 'Reviews' },
      },
    },
  },
}))

const ReviewItem = defineNestedType(() => ({
  name: 'ReviewItem',
  fields: {
    author: { type: 'string' },
    avatar: { type: 'string' },
    avatar_alt: { type: 'string' },
    content: { type: 'string' },
  },
  extensions: {
    stackbit: {
      label: 'Review Item',
      fields: {
        author: { label: 'Author' },
        avatar: { label: 'Author Image' },
        avatar_alt: { label: 'Author Image Alt Text' },
        content: { label: 'Content' },
      },
    },
  },
}))
