export default {
  type: 'object',
  name: 'stackbit_page_meta',
  title: 'Page meta data',
  fields: [
    {
      type: 'string',
      name: 'title',
      title: 'Title',
      description: 'The page title that goes into the <title> tag',
      validation: null,
    },
    {
      type: 'string',
      name: 'description',
      title: 'Description',
      description: 'The page description that goes into the <meta name="description"> tag',
      validation: null,
    },
    {
      type: 'array',
      name: 'robots',
      title: 'Robots',
      description: 'The items that go into the <meta name="robots"> tag',
      validation: null,
      of: [
        {
          type: 'string',
        },
      ],
      options: {
        list: ['all', 'index', 'follow', 'noindex', 'nofollow', 'noimageindex', 'notranslate', 'none'],
      },
    },
    {
      type: 'array',
      name: 'extra',
      title: 'Extra',
      description: 'Additional definition for specific meta tags such as open-graph, twitter, etc.',
      validation: null,
      of: [
        {
          type: 'object',
          fields: [
            {
              type: 'string',
              name: 'name',
              title: 'Name',
              validation: null,
            },
            {
              type: 'string',
              name: 'value',
              title: 'Value',
              validation: null,
            },
            {
              type: 'string',
              name: 'keyName',
              title: 'Key Name',
              initialValue: 'name',
              validation: null,
            },
            {
              type: 'boolean',
              name: 'relativeUrl',
              title: 'Relative Url',
              validation: null,
            },
          ],
          preview: {
            select: {
              title: 'name',
            },
          },
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
