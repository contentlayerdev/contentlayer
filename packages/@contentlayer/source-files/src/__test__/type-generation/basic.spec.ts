import { renderTypes } from '@contentlayer/core'
import { JaegerNodeTracing } from '@contentlayer/utils'
import { pipe, T } from '@contentlayer/utils/effect'

import { makeSource } from '../..'
import { defineDocumentType } from '../../schema/defs'

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
  it('simple schema', async () => {
    const schemaDef = await pipe(
      T.tryPromise(() => makeSource({ documentTypes: [TestPost], contentDirPath: '' })),
      T.chain((source) => source.provideSchema),
      T.provideSomeLayer(JaegerNodeTracing('contentlayer-cli')),
      T.runPromise,
    )
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
