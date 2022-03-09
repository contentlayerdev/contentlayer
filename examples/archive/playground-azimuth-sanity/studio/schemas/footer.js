export default {
  type: 'object',
  name: 'footer',
  title: 'Footer Configuration',
  fields: [
    {
      type: 'array',
      name: 'sections',
      title: 'Sections',
      description: 'Footer sections',
      validation: null,
      of: [
        {
          type: 'footer_form',
        },
        {
          type: 'footer_nav',
        },
        {
          type: 'footer_text',
        },
      ],
    },
    {
      type: 'boolean',
      name: 'has_nav',
      title: 'Enable Horizontal Navigation',
      description: 'Display the horizontal navigation menu bar in the footer',
      initialValue: true,
      validation: null,
    },
    {
      type: 'array',
      name: 'nav_links',
      title: 'Horizontal Navigation Links',
      description: 'List of horizontal navigation links',
      validation: null,
      of: [
        {
          type: 'action',
        },
      ],
    },
    {
      type: 'string',
      name: 'content',
      title: 'Footer Content',
      description: 'The copyright text displayed in the footer',
      validation: null,
    },
    {
      type: 'array',
      name: 'links',
      title: 'Links',
      description: 'A list of links displayed in the footer',
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
      title: 'content',
    },
  },
}
