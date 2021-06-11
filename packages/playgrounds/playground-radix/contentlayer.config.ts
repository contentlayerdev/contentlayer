import { defineDocument, fromLocalContent } from 'contentlayer/source-local'

export const Post = defineDocument(() => ({
  name: 'Post',
  filePathPattern: `**/*.mdx`,
  fileType: 'mdx',
  fields: {
    metaTitle: {
      type: 'string',
      required: true,
    },
    metaDescription: {
      type: 'string',
      required: false,
    },
    name: {
      type: 'string',
      required: false,
    },
    aria: {
      type: 'url',
      required: false,
    },
    publishedName: {
      type: 'string',
      required: false,
    },
    features: {
      type: 'list',
      of: { type: 'string' },
      required: false,
    },
  },
}))

export default fromLocalContent({
  contentDirPath: 'radix/data',
  schema: [Post],
})
