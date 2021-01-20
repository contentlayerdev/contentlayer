import { object } from '../../../lib/schema'
import { action } from './action'
import { form_field } from './form_field'

export const footer = object({
  name: 'footer',
  label: 'Footer Configuration',
  labelField: 'content',
  fields: () => [
    {
      type: 'object',
      name: 'sections',
      label: 'Sections',
      description: 'Footer sections',
      list: true,
      object: [footer_form, footer_nav, footer_text],
    },
    {
      type: 'boolean',
      name: 'has_nav',
      label: 'Enable Horizontal Navigation',
      description: 'Display the horizontal navigation menu bar in the footer',
      default: true,
    },
    {
      type: 'object',
      name: 'nav_links',
      label: 'Horizontal Navigation Links',
      description: 'List of horizontal navigation links',
      object: action,
    },
    {
      type: 'string',
      name: 'content',
      label: 'Footer Content',
      description: 'The copyright text displayed in the footer',
    },
    {
      type: 'object',
      name: 'links',
      label: 'Links',
      description: 'A list of links displayed in the footer',
      list: true,
      object: [action],
    },
  ],
})

const footer_form = object({
  name: 'footer_form',
  label: 'Form',
  labelField: 'title',
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Title',
      description: 'The title of the section',
    },
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
      description:
        'A unique identifier of the form, must not contain whitespace',
      required: true,
    },
    {
      type: 'string',
      name: 'form_action',
      label: 'Form Action',
      description:
        'The path of your custom "success" page, if you want to replace the default success message.',
    },
    {
      type: 'boolean',
      name: 'hide_labels',
      label: 'Hide labels of the form fields?',
      default: false,
    },
    {
      type: 'object',
      name: 'form_fields',
      label: 'Form Fields',
      list: true,
      object: [form_field],
    },
    {
      type: 'string',
      name: 'submit_label',
      label: 'Submit Button Label',
      required: true,
    },
  ],
})

const footer_nav = object({
  name: 'footer_nav',
  label: 'Vertical Navigation',
  labelField: 'title',
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Title',
      description: 'The title of the section',
    },
    {
      type: 'object',
      name: 'nav_links',
      label: 'Vertical Navigation Links',
      description: 'List of vertical navigation links',
      object: action,
    },
  ],
})

const footer_text = object({
  name: 'footer_text',
  label: 'Text',
  labelField: 'title',
  fields: [
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
      type: 'string',
      name: 'title',
      label: 'Title',
      description: 'The title of the section',
    },
    {
      type: 'markdown',
      name: 'content',
      label: 'Content',
      description: 'The text content of the section',
    },
  ],
})
