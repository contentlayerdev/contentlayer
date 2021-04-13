import { defineObject } from 'contentlayer/source-local'

export const form_field = defineObject(() => ({
  name: 'form_field',
  label: 'Form Field',
  labelField: 'name',
  fields: {
    input_type: {
      type: 'enum',
      label: 'Type',
      options: ['text', 'textarea', 'email', 'tel', 'number', 'checkbox', 'select'],
      description: 'Type of the form field',
      required: true,
    },
    name: {
      type: 'string',
      label: 'Name',
      description: 'The name of the field, submitted with the form',
      required: true,
    },
    label: {
      type: 'string',
      label: 'Label',
      description: 'The caption of the field, shown above the field input',
    },
    default_value: {
      type: 'string',
      label: 'Placeholder text or default value',
      description: 'The placeholder for textual field types or default option for select field',
    },
    options: {
      type: 'list',
      label: 'Options',
      description: 'The list of options for select field',
      of: { type: 'string' },
    },
    is_required: {
      type: 'boolean',
      label: 'Is the field required?',
      default: false,
    },
  },
}))
