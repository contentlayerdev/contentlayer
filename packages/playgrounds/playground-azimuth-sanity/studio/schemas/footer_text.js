export default {
  type: 'object',
  name: 'footer_text',
  title: 'Text',
  fields: [
    {
      type: 'string',
      name: 'title',
      title: 'Title',
      description: 'The title of the section',
      validation: null,
    },
    {
      type: 'image',
      name: 'image',
      title: 'Image',
      description: 'The image displayed in the section',
      validation: null,
    },
    {
      type: 'string',
      name: 'image_alt',
      title: 'Image Alt Text',
      description: 'The alt text of the image',
      validation: null,
    },
    {
      type: 'string',
      name: 'image_url',
      title: 'Image URL',
      description: 'The url of the image',
      validation: null,
    },
    {
      type: 'markdown',
      name: 'content',
      title: 'Content',
      description: 'The text content of the section',
      validation: null,
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
}
