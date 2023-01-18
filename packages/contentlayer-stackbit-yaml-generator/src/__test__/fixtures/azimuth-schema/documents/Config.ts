import { defineDocumentType, defineFields, defineNestedType } from 'contentlayer/source-files'

import { Action } from '../nested/Action.js'
import { FormField } from '../nested/FormField.js'

export const Config = defineDocumentType(() => ({
  name: 'Config',
  filePathPattern: 'data/config.json',
  isSingleton: true,
  fields: {
    title: {
      type: 'string',
      description: 'Site title',
      required: true,
    },
    path_prefix: {
      type: 'string',
      description:
        'The base URL of this site. Useful for sites hosted under specific path, e.g.: https://www.example.com/my-site/',
      required: true,
    },
    domain: {
      type: 'string',
      description: 'The domain of your site, including the protocol, e.g. https://mysite.com/',
    },
    favicon: {
      type: 'string',
      description: 'A square icon that represents your website',
    },
    palette: {
      type: 'enum',
      description: 'The color palette of the site',
      options: ['blue', 'cyan', 'green', 'orange', 'purple'],
      default: 'blue',
      required: true,
    },
    base_font: {
      type: 'enum',
      options: ['fira-sans', 'nunito-sans', 'system-sans'],
      default: 'nunito-sans',
      required: true,
    },
    header: { type: 'nested', of: Header, required: true },
    // header: schema.embedded({ model: Header, required: true }),
    // header: { type: 'embedded', model: Header, required: true },
    footer: { type: 'nested', of: Footer, required: true },
  },
  extensions: {
    stackbit: {
      label: 'Site Configuration',
      fields: {
        title: { label: 'Title' },
        path_prefix: { label: 'Base URL', hidden: true },
        domain: { label: 'Domain' },
        favicon: { label: 'Favicon' },
        palette: { label: 'Color Palette' },
        base_font: { label: 'Font' },
        header: { label: 'Header Configuration' },
        footer: { label: 'Footer Configuration' },
      },
      file: 'config.json',
    },
  },
}))

const Header = defineNestedType(() => ({
  name: 'Header',
  fields: {
    logo_img: {
      type: 'string',
      description: 'The logo image displayed in the header (if no logo added, the site title is displayed instead)',
    },
    logo_img_alt: {
      type: 'string',
      description: 'The alt text of the logo image',
    },
    has_nav: {
      type: 'boolean',
      description: 'Display the navigation menu bar in the header',
      default: true,
    },
    nav_links: {
      type: 'list',
      description: 'List of navigation links',
      of: Action,
    },
  },
  extensions: {
    stackbit: {
      label: 'Header Configuration',
      fields: {
        logo_img: { label: 'Logo' },
        logo_img_alt: { label: 'Logo Alt Text' },
        has_nav: { label: 'Enable Navigation' },
        nav_links: { label: 'Navigation Links' },
      },
    },
  },
}))

const Footer = defineNestedType(() => ({
  name: 'Footer',
  fields: {
    sections: {
      type: 'list',
      description: 'Footer sections',
      of: [FooterForm, FooterNav, FooterText],
      typeField: 'type',
    },
    has_nav: {
      type: 'boolean',
      description: 'Display the horizontal navigation menu bar in the footer',
      default: true,
    },
    nav_links: {
      type: 'list',
      description: 'List of horizontal navigation links',
      of: Action,
    },
    content: {
      type: 'string',
      description: 'The copyright text displayed in the footer',
    },
    links: {
      type: 'list',
      description: 'A list of links displayed in the footer',
      of: Action,
    },
  },
  extensions: {
    stackbit: {
      label: 'Footer Configuration',
      labelField: 'content',
      fields: {
        sections: { label: 'Sections' },
        has_nav: { label: 'Enable Horizontal Navigation' },
        nav_links: { label: 'Horizontal Navigation Links' },
        content: { label: 'Footer Content' },
        links: { label: 'Links' },
      },
    },
  },
}))

const footerSectionBaseFields = defineFields({
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
})

const footerSectionBaseFieldsExtension = {
  title: {
    label: 'Title',
  },
  type: {
    label: 'Section type',
  },
} as const

const FooterForm = defineNestedType(() => ({
  name: 'FooterForm',
  fields: {
    ...footerSectionBaseFields,
    content: {
      type: 'markdown',
      description: 'The content of the section, appears above the form',
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
      label: 'Footer Form',
      labelField: 'title',
      fields: {
        ...footerSectionBaseFieldsExtension,
        content: { label: 'Content' },
        form_id: { label: 'Form ID' },
        form_action: { label: 'Form Action' },
        hide_labels: { label: 'Hide Labels' },
        form_fields: { label: 'Form Fields' },
        submit_label: { label: 'Submit Button Label' },
      },
    },
  },
}))

const FooterNav = defineNestedType(() => ({
  name: 'FooterNav',
  fields: {
    ...footerSectionBaseFields,
    nav_links: {
      type: 'list',
      description: 'List of vertical navigation links',
      of: Action,
    },
  },
  extensions: {
    stackbit: {
      label: 'Vertical Navigation',
      labelField: 'title',
      fields: {
        ...footerSectionBaseFieldsExtension,
        nav_links: { label: 'Vertical Navigation Links' },
      },
    },
  },
}))

const FooterText = defineNestedType(() => ({
  name: 'FooterText',
  fields: {
    ...footerSectionBaseFields,
    image: {
      type: 'string',
      description: 'The image displayed in the section',
    },
    image_alt: {
      type: 'string',
      description: 'The alt text of the image',
    },
    image_url: {
      type: 'string',
      description: 'The url of the image',
    },
    content: {
      type: 'markdown',
      description: 'The text content of the section',
    },
  },
  extensions: {
    stackbit: {
      label: 'Text',
      labelField: 'title',
      fields: {
        ...footerSectionBaseFieldsExtension,
        image: { label: 'Image' },
        image_alt: { label: 'Image Alt Text' },
        image_url: { label: 'Image URL' },
        content: { label: 'Content' },
      },
    },
  },
}))
