import { defineNestedType } from 'contentlayer2/source-files'

export const FormField = defineNestedType(() => ({
  name: 'FormField',
  fields: {
    input_type: {
      type: 'enum',
      options: ['text', 'textarea', 'email', 'tel', 'number', 'checkbox', 'select'],
      description: 'Type of the form field',
      required: true,
    },
    name: {
      type: 'string',
      description: 'The name of the field, submitted with the form',
      required: true,
    },
    label: {
      type: 'string',
      description: 'The caption of the field, shown above the field input',
    },
    default_value: {
      type: 'string',
      description: 'The placeholder for textual field types or default option for select field',
    },
    options: {
      type: 'list',
      description: 'The list of options for select field',
      of: { type: 'string' },
    },
    is_required: {
      type: 'boolean',
      default: false,
    },
  },
  extensions: {
    stackbit: {
      label: 'Form Field',
      labelField: 'name',
      fields: {
        input_type: { label: 'Type' },
        name: { label: 'Name' },
        label: { label: 'Label' },
        default_value: { label: 'Placeholder text or default value' },
        options: { label: 'Options' },
        is_required: { label: 'Is the field required?' },
      },
    },
  },
}))
