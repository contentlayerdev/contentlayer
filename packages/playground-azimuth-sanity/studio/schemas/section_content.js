export default {
  type: 'object',
  name: 'section_content',
  title: 'Content Section',
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
      type: 'markdown',
      name: 'content',
      title: 'Content',
      description: 'The text content of the section',
      validation: null,
    },
    {
      type: 'image',
      name: 'image',
      title: 'Image',
      description: 'The image of the section',
      validation: null,
    },
    {
      type: 'string',
      name: 'image_alt',
      title: 'Image Alt Text',
      description: 'The alt text of the section image',
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
