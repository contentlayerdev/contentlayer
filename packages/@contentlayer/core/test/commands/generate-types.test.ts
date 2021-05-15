import { defineDocument, fromLocalContent } from 'contentlayer/source-local'
import { buildSource } from '../../src'

export const post = defineDocument(() => ({
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
  computedFields: {
    slug: { type: 'string', resolve: (_) => _._id.replace('.md', '') },
  },
}))

describe('generate-types', () => {
  test('simple schema', async () => {
    const schema = await fromLocalContent({ schema: [post], contentDirPath: '' }).provideSchema()
    const typeSource = buildSource(schema)
    expect(typeSource).toMatchSnapshot()
  })
})
