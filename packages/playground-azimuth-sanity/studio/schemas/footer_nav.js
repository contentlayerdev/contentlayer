export default {
  type: 'object',
  name: 'footer_nav',
  title: 'Vertical Navigation',
  fields: [
    {
      type: 'string',
      name: 'title',
      title: 'Title',
      description: 'The title of the section',
      validation: null,
    },
    {
      type: 'array',
      name: 'nav_links',
      title: 'Vertical Navigation Links',
      description: 'List of vertical navigation links',
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
