import { renderTypes } from '@contentlayer/core'
import { provideJaegerTracing } from '@contentlayer/utils'
import { pipe, provideConsole, T } from '@contentlayer/utils/effect'
import { expect, test } from 'vitest'

import type { DocumentTypes } from '../../index.js'
import { makeSource } from '../../index.js'
import { defineDocumentType } from '../../schema/defs/index.js'

const renderTypeSource = async (documentTypes: DocumentTypes) => {
  const esbuildHash = 'not-important-for-this-test'
  const schemaDef = await pipe(
    T.tryPromise(() => makeSource({ documentTypes, contentDirPath: '' })(undefined)),
    T.chain((source) => source.provideSchema(esbuildHash)),
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
        disableImportAliasWarning: false,
        experimental: { enableDynamicBuild: false },
        onSuccess: undefined,
      },
    },
  })

  return typeSource
}

// TODO rewrite test for gendotpkg
test('generate-types: simple schema', async () => {
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

  expect(typeSource).toMatchSnapshot()
})

test('generate-types: simple schema with optional fields', async () => {
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
      },
    },
    computedFields: {
      slug: { type: 'string', resolve: (_) => _._id.replace('.md', '') },
    },
  }))

  const typeSource = await renderTypeSource([TestPost])

  expect(typeSource).toMatchSnapshot()
})

test('generate-types: references with embedded schema', async () => {
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

  expect(typeSource).toMatchSnapshot()
})
