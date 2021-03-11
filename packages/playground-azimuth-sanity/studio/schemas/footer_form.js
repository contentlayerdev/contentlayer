export default {
  type: 'object',
  name: 'footer_form',
  title: 'Form',
  fields: [
    {
      type: 'string',
      name: 'title',
      title: 'Title',
      description: 'The title of the section',
      validation: null,
    },
    {
      type: 'markdown',
      name: 'content',
      title: 'Content',
      description: 'The content of the section, appears above the form',
      validation: null,
    },
    {
      type: 'string',
      name: 'form_id',
      title: 'Form ID',
      description: 'A unique identifier of the form, must not contain whitespace',
      validation: (Rule) => Rule.required(),
    },
    {
      type: 'string',
      name: 'form_action',
      title: 'Form Action',
      description: 'The path of your custom "success" page, if you want to replace the default success message.',
      validation: null,
    },
    {
      type: 'boolean',
      name: 'hide_labels',
      title: 'Hide labels of the form fields?',
      validation: null,
    },
    {
      type: 'array',
      name: 'form_fields',
      title: 'Form Fields',
      validation: null,
      of: [
        {
          type: 'form_field',
        },
      ],
    },
    {
      type: 'string',
      name: 'submit_label',
      title: 'Submit Button Label',
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
}
