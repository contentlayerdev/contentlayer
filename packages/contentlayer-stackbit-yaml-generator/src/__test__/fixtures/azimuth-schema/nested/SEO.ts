import { defineNestedType } from 'contentlayer2/source-files'

export const SEO = defineNestedType(() => ({
  name: 'SEO',
  fields: {
    title: {
      type: 'string',
      description: 'The page title that goes into the <title> tag',
    },
    description: {
      type: 'string',
      description: 'The page description that goes into the <meta name="description"> tag',
    },
    robots: {
      type: 'list',
      description: 'The items that go into the <meta name="robots"> tag',
      of: {
        type: 'enum',
        options: ['all', 'index', 'follow', 'noindex', 'nofollow', 'noimageindex', 'notranslate', 'none'],
      },
    },
    extra: {
      type: 'list',
      description: 'Additional definition for specific meta tags such as open-graph, twitter, etc.',
      of: Extra,
    },
  },
  extensions: {
    stackbit: {
      label: 'Page meta data',
      fields: {
        title: { label: 'Title' },
        description: { label: 'Description' },
        robots: { label: 'Robots' },
        extra: { label: 'Extra' },
      },
    },
  },
}))

const Extra = defineNestedType(() => ({
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
}))
