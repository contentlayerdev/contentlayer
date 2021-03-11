export default {
  type: 'object',
  name: 'review_item',
  title: 'Review Item',
  fields: [
    {
      type: 'string',
      name: 'author',
      title: 'Author',
      validation: null,
    },
    {
      type: 'image',
      name: 'avatar',
      title: 'Author Image',
      validation: null,
    },
    {
      type: 'string',
      name: 'avatar_alt',
      title: 'Author Image Alt Text',
      validation: null,
    },
    {
      type: 'text',
      name: 'content',
      title: 'Content',
      validation: null,
    },
  ],
  preview: {
    select: {
      title: 'author',
    },
  },
}
