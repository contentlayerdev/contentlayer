export default {
  title: 'Page',
  name: 'page',
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
    },
    {
      type: 'text',
      title: 'Subtitle',
      name: 'subtitle',
      description: 'The text shown below the page title'
    },
    {
      type: 'image',
      title: 'Image',
      name: 'image',
      description: 'The image shown below the page title'
    },
    {
      type: 'markdown',
      title: 'Content',
      name: 'content',
      description: 'Page content'
    }
  ]
}
