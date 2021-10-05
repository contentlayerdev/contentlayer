import { renderTypes } from '@contentlayer/core'
import { JaegerNodeTracing } from '@contentlayer/utils'
import { pipe, T } from '@contentlayer/utils/effect'
import { expect, test } from '@playwright/test'

import { makeSource } from '../../index.js'
import { defineDocumentType } from '../../schema/defs/index.js'

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
test.describe('generate-types', () => {
  test('simple schema', async () => {
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
    expect(typeSource).toMatchSnapshot({ name: 'ok' })
  })
})
