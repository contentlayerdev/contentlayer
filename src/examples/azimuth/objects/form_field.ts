import { object } from '../../../lib/schema'

export const form_field = object({
  name: 'form_field',
  label: 'Form Field',
  labelField: 'name',
  fields: [
    {
      type: 'enum',
      name: 'input_type',
      label: 'Type',
      options: [
        'text',
        'textarea',
        'email',
        'tel',
        'number',
        'checkbox',
        'select',
      ],
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
      description:
        'The placeholder for textual field types or default option for select field',
    },
    {
      type: 'string',
      name: 'options',
      label: 'Options',
      description: 'The list of options for select field',
      list: true,
    },
    {
      type: 'boolean',
      name: 'is_required',
      label: 'Is the field required?',
      default: false,
    },
  ],
})
