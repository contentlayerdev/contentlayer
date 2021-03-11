export default {
  type: 'document',
  name: 'landing',
  title: 'Landing Page',
  fields: [
    {
      type: 'string',
      name: 'title',
      title: 'Title',
      description: 'The title of the page',
      validation: (Rule) => Rule.required(),
    },
    {
      type: 'array',
      name: 'sections',
      title: 'Sections',
      description: 'Page sections',
      validation: null,
      of: [
        {
          type: 'section_content',
        },
        {
          type: 'section_cta',
        },
        {
          type: 'section_faq',
        },
        {
          type: 'section_features',
        },
        {
          type: 'section_hero',
        },
        {
          type: 'section_posts',
        },
        {
          type: 'section_pricing',
        },
        {
          type: 'section_reviews',
        },
        {
          type: 'section_contact',
        },
      ],
    },
    {
      type: 'stackbit_page_meta',
      name: 'seo',
      title: 'Seo',
      validation: null,
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
}
