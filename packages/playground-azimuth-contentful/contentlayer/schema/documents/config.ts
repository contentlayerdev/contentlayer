import { defineDocument, defineObject } from 'contentlayer/source-local'
import { action } from '../objects/action'
import { form_field } from '../objects/form_field'

export const config = defineDocument(() => ({
  name: 'config',
  label: 'Site Configuration',
  filePathPattern: 'data/config.json',
  fields: {
    title: {
      type: 'string',
      label: 'Title',
      description: 'Site title',
      required: true,
    },
    path_prefix: {
      type: 'string',
      label: 'Base URL',
      description:
        'The base URL of this site. Useful for sites hosted under specific path, e.g.: https://www.example.com/my-site/',
      required: true,
      hidden: true,
    },
    domain: {
      type: 'string',
      label: 'Domain',
      description: 'The domain of your site, including the protocol, e.g. https://mysite.com/',
    },
    favicon: {
      type: 'image',
      label: 'Favicon',
      description: 'A square icon that represents your website',
    },
    palette: {
      type: 'enum',
      label: 'Color Palette',
      description: 'The color palette of the site',
      options: ['blue', 'cyan', 'green', 'orange', 'purple'],
      default: 'blue',
      required: true,
    },
    base_font: {
      type: 'enum',
      label: 'Font',
      options: ['fira-sans', 'nunito-sans', 'system-sans'],
      default: 'nunito-sans',
      required: true,
    },
    header: {
      type: 'object',
      label: 'Header Configuration',
      required: true,
      object: header,
    },
    footer: {
      type: 'object',
      label: 'Footer Configuration',
      required: true,
      object: footer,
    },
    // file: 'config.json',
  },
}))

const header = defineObject(() => ({
  name: 'header',
  label: 'Header Configuration',
  fields: {
    logo_img: {
      type: 'image',
      label: 'Logo',
      description: 'The logo image displayed in the header (if no logo added, the site title is displayed instead)',
    },
    logo_img_alt: {
      type: 'string',
      label: 'Logo Alt Text',
      description: 'The alt text of the logo image',
    },
    has_nav: {
      type: 'boolean',
      label: 'Enable Navigation',
      description: 'Display the navigation menu bar in the header',
      default: true,
    },
    nav_links: {
      type: 'list',
      label: 'Navigation Links',
      description: 'List of navigation links',
      of: { type: 'object', object: action },
    },
  },
}))

const footer = defineObject(() => ({
  name: 'footer',
  label: 'Footer Configuration',
  labelField: 'content',
  fields: {
    sections: {
      type: 'polymorphic_list',
      label: 'Sections',
      description: 'Footer sections',
      of: [footer_form, footer_nav, footer_text].map((object) => ({ type: 'object', object })),
      typeField: 'type',
    },
    has_nav: {
      type: 'boolean',
      label: 'Enable Horizontal Navigation',
      description: 'Display the horizontal navigation menu bar in the footer',
      default: true,
    },
    nav_links: {
      type: 'list',
      label: 'Horizontal Navigation Links',
      description: 'List of horizontal navigation links',
      of: { type: 'object', object: action },
    },
    content: {
      type: 'string',
      label: 'Footer Content',
      description: 'The copyright text displayed in the footer',
    },
    links: {
      type: 'list',
      label: 'Links',
      description: 'A list of links displayed in the footer',
      of: { type: 'object', object: action },
    },
  },
}))

const footerSectionBaseFields = {
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

const footer_form = defineObject(() => ({
  name: 'footer_form',
  label: 'Form',
  labelField: 'title',
  fields: {
    ...footerSectionBaseFields,
    content: {
      type: 'markdown',
      label: 'Content',
      description: 'The content of the section, appears above the form',
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

const footer_nav = defineObject(() => ({
  name: 'footer_nav',
  label: 'Vertical Navigation',
  labelField: 'title',
  fields: {
    ...footerSectionBaseFields,
    nav_links: {
      type: 'list',
      label: 'Vertical Navigation Links',
      description: 'List of vertical navigation links',
      of: { type: 'object', object: action },
    },
  },
}))

const footer_text = defineObject(() => ({
  name: 'footer_text',
  label: 'Text',
  labelField: 'title',
  fields: {
    ...footerSectionBaseFields,
    image: {
      type: 'image',
      label: 'Image',
      description: 'The image displayed in the section',
    },
    image_alt: {
      type: 'string',
      label: 'Image Alt Text',
      description: 'The alt text of the image',
    },
    image_url: {
      type: 'string',
      label: 'Image URL',
      description: 'The url of the image',
    },
    content: {
      type: 'markdown',
      label: 'Content',
      description: 'The text content of the section',
    },
  },
}))
