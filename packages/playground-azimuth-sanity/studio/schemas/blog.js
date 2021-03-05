export default {
  title: 'Blog',
  name: 'blog',
  type: 'document',
  preview: { select: { title: 'title' } },
  fields: [
    {
      type: 'string',
      title: 'Title',
      name: 'title',
      description: 'The title of the page',
      validation: Rule => Rule.required()
    },
    {
      type: 'slug',
      title: 'Slug',
      name: 'slug',
      description: 'The URL path of this page relative to the site domain',
      validation: Rule => Rule.required(),
      options: {
        source: 'title'
      }
    }
  ]
}
