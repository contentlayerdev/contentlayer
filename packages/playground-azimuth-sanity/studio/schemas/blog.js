export default {
  type: 'document',
  name: 'blog',
  title: 'Blog',
  fields: [
    {
      type: 'string',
      name: 'title',
      title: 'Title',
      description: 'The title of the page',
      validation: (Rule) => Rule.required(),
    },
    {
      type: 'stackbit_page_meta',
      name: 'seo',
      title: 'Seo',
      validation: null,
    },
  ],
  singleInstance: true,
  preview: {
    select: {
      title: 'title',
    },
  },
}
