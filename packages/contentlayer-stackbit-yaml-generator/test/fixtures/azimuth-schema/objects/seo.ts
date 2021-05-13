import { defineObject } from 'contentlayer/source-local'

export const seo = defineObject(() => ({
  name: 'seo',
  label: 'Page meta data',
  fields: {
    title: {
      type: 'string',
      label: 'Title',
      description: 'The page title that goes into the <title> tag',
    },
    description: {
      type: 'string',
      label: 'Description',
      description: 'The page description that goes into the <meta name="description"> tag',
    },
    robots: {
      type: 'list',
      label: 'Robots',
      description: 'The items that go into the <meta name="robots"> tag',
      of: {
        type: 'enum',
        options: ['all', 'index', 'follow', 'noindex', 'nofollow', 'noimageindex', 'notranslate', 'none'],
      },
    },
    extra: {
      type: 'list',
      label: 'Extra',
      description: 'Additional definition for specific meta tags such as open-graph, twitter, etc.',
      of: {
        type: 'inline_object',
        labelField: 'name',
        fields: {
          name: { type: 'string', label: 'Name' },
          value: { type: 'string', label: 'Value' },
          keyName: {
            type: 'string',
            label: 'Key Name',
            default: 'name',
          },
          relativeUrl: { type: 'boolean', label: 'Relative Url' },
        },
      },
    },
  },
}))
