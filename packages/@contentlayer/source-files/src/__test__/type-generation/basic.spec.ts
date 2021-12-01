import { renderTypes } from '@contentlayer/core'
import { provideJaegerTracing } from '@contentlayer/utils'
import { pipe, provideConsole, T } from '@contentlayer/utils/effect'
import t from 'tap'

import { makeSource } from '../../index.js'
import { defineDocumentType } from '../../schema/defs/index.js'

const TestPost = defineDocumentType(() => ({
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
t.test('generate-types', async (t) => {
  t.test('simple schema', async (t) => {
    const schemaDef = await pipe(
      T.tryPromise(() => makeSource({ documentTypes: [TestPost], contentDirPath: '' })),
      T.chain((source) => source.provideSchema),
      provideJaegerTracing('contentlayer-cli'),
      provideConsole,
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
          date: undefined,
        },
      },
    })

    t.matchSnapshot(typeSource) //.toMatchSnapshot('simple-schema.txt')
  })
})
