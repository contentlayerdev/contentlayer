export default {
  type: 'object',
  name: 'section_cta',
  title: 'Call to Action Section',
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
      description: 'The subtitle of the section',
      validation: null,
    },
    {
      type: 'array',
      name: 'actions',
      title: 'Action Buttons',
      validation: null,
      of: [
        {
          type: 'action',
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
}
