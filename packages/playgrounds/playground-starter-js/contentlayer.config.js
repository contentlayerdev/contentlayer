import { fromLocalContent } from 'contentlayer/source-local'
import { defineDocument } from 'contentlayer/source-local/schema'
import highlight from 'rehype-highlight'

export const Post = defineDocument(() => ({
  name: 'Post',
  filePathPattern: `**/*.md`,
  fields: {
    title: {
      type: 'string',
      description: 'The title of the post',
      required: true,
    },
    date: {
      type: 'date',
      description: 'The date of the post',
      required: true,
    },
  },
}))

export default fromLocalContent({
  contentDirPath: 'posts',
  schema: [Post],
  markdown: { rehypePlugins: [highlight] },
})
