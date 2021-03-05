export default {
  title: 'Landing Page',
  name: 'landing',
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
      type: 'array',
      title: 'Sections',
      name: 'sections',
      description: 'Page sections',
      of: [
        {type: 'section_cta'},
        {type: 'section_contact'},
        {type: 'section_content'},
        {type: 'section_faq'},
        {type: 'section_features'},
        {type: 'section_hero'},
        {type: 'section_posts'},
        {type: 'section_pricing'},
        {type: 'section_reviews'}
      ]
    }
  ]
}
