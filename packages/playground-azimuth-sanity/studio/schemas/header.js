export default {
  type: 'object',
  name: 'header',
  title: 'Header Configuration',
  fields: [
    {
      type: 'image',
      name: 'logo_img',
      title: 'Logo',
      description: 'The logo image displayed in the header (if no logo added, the site title is displayed instead)',
      validation: null,
    },
    {
      type: 'string',
      name: 'logo_img_alt',
      title: 'Logo Alt Text',
      description: 'The alt text of the logo image',
      validation: null,
    },
    {
      type: 'boolean',
      name: 'has_nav',
      title: 'Enable Navigation',
      description: 'Display the navigation menu bar in the header',
      initialValue: true,
      validation: null,
    },
    {
      type: 'array',
      name: 'nav_links',
      title: 'Navigation Links',
      description: 'List of navigation links',
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
      title: 'logo_img_alt',
    },
  },
}
