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
      type: 'string',
      name: 'url_path',
      title: 'URL Path',
      description:
        'The URL path of this page relative to site root. For example, the site root page would be "/", and post page would be "posts/new-post/"',
      validation: (Rule) => Rule.required(),
    },
    {
      type: 'seo',
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
