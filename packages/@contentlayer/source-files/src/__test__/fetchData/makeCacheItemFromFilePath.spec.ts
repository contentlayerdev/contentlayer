import { E } from '@contentlayer/utils/effect'
import test from 'ava'
import path from 'path'
import { fileURLToPath } from 'url'

// Given we're running the tests of the ./dist directory, we need to point the `__dirname` back to the `src` directory
const testFileDir = path.dirname(fileURLToPath(import.meta.url)).replace('dist', 'src')

const contentDirPath = path.join(testFileDir, 'fixtures', 'content')

import { defineDocumentType } from '../../schema/defs/index.js'
import { runTest } from './utils.js'

test('a.md: hello world should work', async (t) => {
  const TestPost = defineDocumentType(() => ({
    name: 'TestPost',
    filePathPattern: `**/*.md`,
    fields: {},
  }))

  const { result } = await runTest({ documentTypes: [TestPost], contentDirPath, relativeFilePath: 'a.md' })

  t.is(result._tag, 'Right')
  if (E.isRight(result)) {
    t.truthy(result.right.document)
  }
})

test('a.md: file extension - contentType mismatch', async (t) => {
  const TestPost = defineDocumentType(() => ({
    name: 'TestPost',
    filePathPattern: `**/*.md`,
    contentType: 'data',
    fields: {},
  }))

  const { result } = await runTest({ documentTypes: [TestPost], contentDirPath, relativeFilePath: 'a.md' })

  t.is(result._tag, 'Left')
  if (E.isLeft(result)) {
    t.is(result.left._tag, 'FileExtensionMismatch')
  }
})

test('b.md: missing required field: list of strings', async (t) => {
  const TestPost = defineDocumentType(() => ({
    name: 'TestPost',
    filePathPattern: `**/*.md`,
    fields: {
      tags: { type: 'list', of: { type: 'string' }, required: true },
    },
  }))

  const { result } = await runTest({ documentTypes: [TestPost], contentDirPath, relativeFilePath: 'b.md' })

  t.is(result._tag, 'Left')
  if (E.isLeft(result)) {
    t.is(result.left._tag, 'MissingRequiredFieldsError')
  }
})

test('b.md: missing optional field: list of strings', async (t) => {
  const TestPost = defineDocumentType(() => ({
    name: 'TestPost',
    filePathPattern: `**/*.md`,
    fields: {
      tags: { type: 'list', of: { type: 'string' }, required: false },
    },
  }))

  const { result } = await runTest({ documentTypes: [TestPost], contentDirPath, relativeFilePath: 'b.md' })

  t.is(result._tag, 'Right')
  if (E.isRight(result)) {
    t.truthy(result.right.document)
  }
})

test('c.md: invalid frontmatter', async (t) => {
  const TestPost = defineDocumentType(() => ({
    name: 'TestPost',
    filePathPattern: `**/*.md`,
    fields: {
      tags: { type: 'list', of: { type: 'string' }, required: true },
      categories: { type: 'list', of: { type: 'string' }, required: true },
      // other: { type: 'boolean', required: true },
    },
  }))

  const { result } = await runTest({ documentTypes: [TestPost], contentDirPath, relativeFilePath: 'c.md' })

  t.is(result._tag, 'Left')
  if (E.isLeft(result)) {
    t.is(result.left._tag, 'IncompatibleFieldDataError')
  }
})
