export default {
  type: 'object',
  name: 'form_field',
  title: 'Form Field',
  fields: [
    {
      type: 'string',
      name: 'input_type',
      title: 'Type',
      description: 'Type of the form field',
      validation: (Rule) => Rule.required(),
      options: {
        list: ['text', 'textarea', 'email', 'tel', 'number', 'checkbox', 'select'],
      },
    },
    {
      type: 'string',
      name: 'name',
      title: 'Name',
      description: 'The name of the field, submitted with the form',
      validation: (Rule) => Rule.required(),
    },
    {
      type: 'string',
      name: 'label',
      title: 'Label',
      description: 'The caption of the field, shown above the field input',
      validation: null,
    },
    {
      type: 'string',
      name: 'default_value',
      title: 'Placeholder text or default value',
      description: 'The placeholder for textual field types or default option for select field',
      validation: null,
    },
    {
      type: 'array',
      name: 'options',
      title: 'Options',
      description: 'The list of options for select field',
      validation: null,
      of: [
        {
          type: 'string',
        },
      ],
    },
    {
      type: 'boolean',
      name: 'is_required',
      title: 'Is the field required?',
      validation: null,
    },
  ],
  preview: {
    select: {
      title: 'name',
    },
  },
}
