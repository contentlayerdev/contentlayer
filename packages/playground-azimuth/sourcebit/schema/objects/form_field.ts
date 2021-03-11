import { defineObject } from '@sourcebit/source-local'

export const form_field = defineObject({
  name: 'form_field',
  label: 'Form Field',
  labelField: 'name',
  fields: [
    {
      type: 'enum',
      name: 'input_type',
      label: 'Type',
      options: ['text', 'textarea', 'email', 'tel', 'number', 'checkbox', 'select'],
      description: 'Type of the form field',
      required: true,
    },
    {
      type: 'string',
      name: 'name',
      label: 'Name',
      description: 'The name of the field, submitted with the form',
      required: true,
    },
    {
      type: 'string',
      name: 'label',
      label: 'Label',
      description: 'The caption of the field, shown above the field input',
    },
    {
      type: 'string',
      name: 'default_value',
      label: 'Placeholder text or default value',
      description: 'The placeholder for textual field types or default option for select field',
    },
    {
      type: 'list',
      name: 'options',
      label: 'Options',
      description: 'The list of options for select field',
      items: [{ type: 'string' }],
    },
    {
      type: 'boolean',
      name: 'is_required',
      label: 'Is the field required?',
      default: false,
    },
  ],
})
