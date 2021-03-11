import { defineObject } from '@sourcebit/source-local'

export const stackbit_page_meta = defineObject({
  name: 'stackbit_page_meta',
  label: 'Page meta data',
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Title',
      description: 'The page title that goes into the <title> tag',
    },
    {
      type: 'string',
      name: 'description',
      label: 'Description',
      description: 'The page description that goes into the <meta name="description"> tag',
    },
    {
      type: 'list',
      name: 'robots',
      label: 'Robots',
      description: 'The items that go into the <meta name="robots"> tag',
      items: [
        {
          type: 'enum',
          options: ['all', 'index', 'follow', 'noindex', 'nofollow', 'noimageindex', 'notranslate', 'none'],
        },
      ],
    },
    {
      type: 'list',
      name: 'extra',
      label: 'Extra',
      description: 'Additional definition for specific meta tags such as open-graph, twitter, etc.',
      items: [
        {
          type: 'inline_object',
          fields: [
            {
              type: 'string',
              name: 'name',
              label: 'Name',
            },
            {
              type: 'string',
              name: 'value',
              label: 'Value',
            },
            {
              type: 'string',
              name: 'keyName',
              label: 'Key Name',
              // initialValue: 'name',
            },
            {
              type: 'boolean',
              name: 'relativeUrl',
              label: 'Relative Url',
            },
          ],
          // preview: {
          //   select: {
          //     label: 'name',
          //   },
          // },
        },
      ],
    },
  ],
})
