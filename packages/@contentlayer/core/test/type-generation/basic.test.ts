import { defineDocumentType, makeSource } from 'contentlayer/source-files'

import { renderTypes } from '../../src/generation/generate-types'

test.todo('generate-types')

const TestPost = defineDocumentType<any>(() => ({
  name: 'TestPost',
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

// TODO rewrite test for gendotpkg
describe('generate-types', () => {
  test('simple schema', async () => {
    const sourcePlugin = await makeSource({ documentTypes: [TestPost], contentDirPath: '' })
    const schemaDef = await sourcePlugin.provideSchema()
    const typeSource = renderTypes({
      schemaDef,
      generationOptions: {
        sourcePluginType: 'local',
        options: {
          fieldOptions: { bodyFieldName: 'body', typeFieldName: 'type' },
          markdown: undefined,
          mdx: undefined,
        },
      },
    })
    expect(typeSource).toMatchSnapshot()
  })
})
