import { renderTypes } from '@contentlayer/core'
import { provideJaegerTracing } from '@contentlayer/utils'
import { pipe, provideConsole, T } from '@contentlayer/utils/effect'
import test from 'ava'

import type { DocumentTypes } from '../../index.js'
import { makeSource } from '../../index.js'
import { defineDocumentType } from '../../schema/defs/index.js'

const renderTypeSource = async (documentTypes: DocumentTypes) => {
  const schemaDef = await pipe(
    T.tryPromise(() => makeSource({ documentTypes, contentDirPath: '' })),
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

  return typeSource
}

// TODO rewrite test for gendotpkg
test('generate-types: simple schema', async (t) => {
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

  const typeSource = await renderTypeSource([TestPost])

  t.snapshot(typeSource)
})

test('generate-types: references with embedded schema', async (t) => {
  const Post = defineDocumentType(() => ({
    name: 'Post',
    fields: {
      title: { type: 'string', required: true },
      author: {
        type: 'reference',
        of: Person,
        required: true,
        embedDocument: true,
      },
    },
  }))

  const Person = defineDocumentType(() => ({
    name: 'Person',
    fields: {
      name: { type: 'string', required: true },
    },
  }))

  const typeSource = await renderTypeSource([Post, Person])

  t.snapshot(typeSource)
})
