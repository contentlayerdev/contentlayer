export default {
  type: 'object',
  name: 'section_contact',
  title: 'Contact Section',
  fields: [
    {
      type: 'string',
      name: 'section_id',
      title: 'Section ID',
      description: 'A unique identifier of the section, must not contain whitespace',
      validation: null,
    },
    {
      type: 'string',
      name: 'title',
      title: 'Title',
      description: 'The title of the section',
      validation: null,
    },
    {
      type: 'string',
      name: 'subtitle',
      title: 'Subtitle',
      description: 'The text shown below the title',
      validation: null,
    },
    {
      type: 'markdown',
      name: 'content',
      title: 'Content',
      description: 'the content of the section, appears above the form',
      validation: null,
    },
    {
      type: 'string',
      name: 'background',
      title: 'Background',
      description: 'The background of the section',
      initialValue: 'gray',
      validation: null,
      options: {
        list: ['gray', 'white'],
      },
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
