import { defineDocument, defineObject } from '@sourcebit/sdk'
import { action } from '../objects/action'
import { form_field } from '../objects/form_field'

export const config = defineDocument({
  name: 'config',
  label: 'Site Configuration',
  filePathPattern: 'content/data/config.json',
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Title',
      description: 'Site title',
      required: true,
    },
    {
      type: 'string',
      name: 'path_prefix',
      label: 'Base URL',
      description:
        'The base URL of this site. Useful for sites hosted under specific path, e.g.: https://www.example.com/my-site/',
      required: true,
      hidden: true,
    },
    {
      type: 'string',
      name: 'domain',
      label: 'Domain',
      description: 'The domain of your site, including the protocol, e.g. https://mysite.com/',
    },
    {
      type: 'image',
      name: 'favicon',
      label: 'Favicon',
      description: 'A square icon that represents your website',
    },
    {
      type: 'enum',
      name: 'palette',
      label: 'Color Palette',
      description: 'The color palette of the site',
      options: ['blue', 'cyan', 'green', 'orange', 'purple'],
      default: 'blue',
      required: true,
    },
    {
      type: 'enum',
      name: 'base_font',
      label: 'Font',
      options: ['fira-sans', 'nunito-sans', 'system-sans'],
      default: 'nunito-sans',
      required: true,
    },
    {
      type: 'object',
      name: 'header',
      label: 'Header Configuration',
      required: true,
      object: () => header,
    },
    {
      type: 'object',
      name: 'footer',
      label: 'Footer Configuration',
      required: true,
      object: () => footer,
    },
  ],
  // file: 'config.json',
})

const header = defineObject({
  name: 'header',
  label: 'Header Configuration',
  fields: [
    {
      type: 'image',
      name: 'logo_img',
      label: 'Logo',
      description: 'The logo image displayed in the header (if no logo added, the site title is displayed instead)',
    },
    {
      type: 'string',
      name: 'logo_img_alt',
      label: 'Logo Alt Text',
      description: 'The alt text of the logo image',
    },
    {
      type: 'boolean',
      name: 'has_nav',
      label: 'Enable Navigation',
      description: 'Display the navigation menu bar in the header',
      default: true,
    },
    {
      type: 'list',
      name: 'nav_links',
      label: 'Navigation Links',
      description: 'List of navigation links',
      items: {
        type: 'object',
        object: action,
      },
    },
  ],
})

const footer = defineObject({
  name: 'footer',
  label: 'Footer Configuration',
  labelField: 'content',
  fields: [
    {
      type: 'list',
      name: 'sections',
      label: 'Sections',
      description: 'Footer sections',
      items: {
        type: 'object',
        object: () => [footer_form, footer_nav, footer_text],
      },
    },
    {
      type: 'boolean',
      name: 'has_nav',
      label: 'Enable Horizontal Navigation',
      description: 'Display the horizontal navigation menu bar in the footer',
      default: true,
    },
    {
      type: 'list',
      name: 'nav_links',
      label: 'Horizontal Navigation Links',
      description: 'List of horizontal navigation links',
      items: {
        type: 'object',
        object: action,
      },
    },
    {
      type: 'string',
      name: 'content',
      label: 'Footer Content',
      description: 'The copyright text displayed in the footer',
    },
    {
      type: 'list',
      name: 'links',
      label: 'Links',
      description: 'A list of links displayed in the footer',
      items: { type: 'object', object: action },
    },
  ],
})

const footerSectionBaseFields = [
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

const footer_form = defineObject({
  name: 'footer_form',
  label: 'Form',
  labelField: 'title',
  fields: [
    ...footerSectionBaseFields,
    {
      type: 'markdown',
      name: 'content',
      label: 'Content',
      description: 'The content of the section, appears above the form',
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

const footer_nav = defineObject({
  name: 'footer_nav',
  label: 'Vertical Navigation',
  labelField: 'title',
  fields: [
    ...footerSectionBaseFields,
    {
      type: 'list',
      name: 'nav_links',
      label: 'Vertical Navigation Links',
      description: 'List of vertical navigation links',
      items: {
        type: 'object',
        object: action,
      },
    },
  ],
})

const footer_text = defineObject({
  name: 'footer_text',
  label: 'Text',
  labelField: 'title',
  fields: [
    ...footerSectionBaseFields,
    {
      type: 'image',
      name: 'image',
      label: 'Image',
      description: 'The image displayed in the section',
    },
    {
      type: 'string',
      name: 'image_alt',
      label: 'Image Alt Text',
      description: 'The alt text of the image',
    },
    {
      type: 'string',
      name: 'image_url',
      label: 'Image URL',
      description: 'The url of the image',
    },
    {
      type: 'markdown',
      name: 'content',
      label: 'Content',
      description: 'The text content of the section',
    },
  ],
})
