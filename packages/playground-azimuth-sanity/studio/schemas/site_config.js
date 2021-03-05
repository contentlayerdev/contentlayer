export default {
  title: 'Site Configuration',
  name: 'site_config',
  type: 'document',
  preview: { select: { title: 'title' } },
  fields: [
    {
      type: 'string',
      title: 'Title',
      name: 'title',
      description: 'Site title',
      validation: Rule => Rule.required()
    },
    {
      type: 'string',
      title: 'Color Palette',
      name: 'palette',
      description: 'The color palette of the site',
      validation: Rule => Rule.required(),
      options: {
        list: ['blue', 'purple', 'green', 'orange']
      }
    },
    {
      type: 'header',
      title: 'Header Configuration',
      name: 'header'
    },
    {
      type: 'footer',
      title: 'Footer Configuration',
      name: 'footer'
    }
  ]
}
