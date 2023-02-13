import path from 'node:path'

import { E } from '@contentlayer/utils/effect'
import { fileURLToPath } from 'url'
import { describe, expect, test } from 'vitest'

// Given we're running the tests of the ./dist directory, we need to point the `__dirname` back to the `src` directory
const testFileDir = path.dirname(fileURLToPath(import.meta.url)).replace('dist', 'src')

import { defineDocumentType } from '../../schema/defs/index.js'
import { runTest } from './utils.js'

describe('3-small-files', () => {
  const contentDirPath = path.join(testFileDir, 'fixtures', '3-small-files')

  test('a.md: hello world should work', async () => {
    const TestPost = defineDocumentType(() => ({
      name: 'TestPost',
      filePathPattern: `**/*.md`,
      fields: {},
    }))

    const { result } = await runTest({ documentTypes: [TestPost], contentDirPath, relativeFilePath: 'a.md' })

    expect(result._tag).toBe('Right')
    if (E.isRight(result)) {
      expect(result.right.document).toBeTruthy()
    }
  })

  test('a.md: file extension - contentType mismatch', async () => {
    const TestPost = defineDocumentType(() => ({
      name: 'TestPost',
      filePathPattern: `**/*.md`,
      contentType: 'data',
      fields: {},
    }))

    const { result } = await runTest({ documentTypes: [TestPost], contentDirPath, relativeFilePath: 'a.md' })

    expect(result._tag).toBe('Left')
    if (E.isLeft(result)) {
      expect(result.left._tag).toBe('FileExtensionMismatch')
    }
  })

  test('b.md: missing required field: list of strings', async () => {
    const TestPost = defineDocumentType(() => ({
      name: 'TestPost',
      filePathPattern: `**/*.md`,
      fields: {
        tags: { type: 'list', of: { type: 'string' }, required: true },
      },
    }))

    const { result } = await runTest({ documentTypes: [TestPost], contentDirPath, relativeFilePath: 'b.md' })

    expect(result._tag, 'Left')
    if (E.isLeft(result)) {
      expect(result.left._tag).toBe('MissingRequiredFieldsError')
    }
  })

  test('b.md: missing optional field: list of strings', async () => {
    const TestPost = defineDocumentType(() => ({
      name: 'TestPost',
      filePathPattern: `**/*.md`,
      fields: {
        tags: { type: 'list', of: { type: 'string' }, required: false },
      },
    }))

    const { result } = await runTest({ documentTypes: [TestPost], contentDirPath, relativeFilePath: 'b.md' })

    expect(result._tag).toBe('Right')
    if (E.isRight(result)) {
      expect(result.right.document).toBeTruthy()
    }
  })

  test('c.md: invalid frontmatter', async () => {
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

    expect(result._tag, 'Left')
    if (E.isLeft(result)) {
      expect(result.left._tag).toBe('IncompatibleFieldDataError')
    }
  })
})

describe('misc-files: empty-markdown', () => {
  const contentDirPath = path.join(testFileDir, 'fixtures', 'misc-files', 'empty-markdown')

  test('empty file should work with no required fields', async () => {
    const TestPost = defineDocumentType(() => ({
      name: 'TestPost',
      filePathPattern: `**/*.md`,
      fields: {},
    }))

    const { result } = await runTest({ documentTypes: [TestPost], contentDirPath, relativeFilePath: 'empty.md' })

    expect(result._tag).toBe('Right')
    if (E.isRight(result)) {
      expect(result.right.document).toBeTruthy()
    }
  })

  test('empty file should fail with required fields', async () => {
    const TestPost = defineDocumentType(() => ({
      name: 'TestPost',
      filePathPattern: `**/*.md`,
      fields: {
        title: { type: 'string', required: true },
      },
    }))

    const { result } = await runTest({ documentTypes: [TestPost], contentDirPath, relativeFilePath: 'empty.md' })

    expect(result._tag).toBe('Left')
    if (E.isLeft(result)) {
      expect(result.left._tag).toBe('MissingRequiredFieldsError')
    }
  })
})

describe('misc-files: empty-mdx', () => {
  const contentDirPath = path.join(testFileDir, 'fixtures', 'misc-files', 'empty-mdx')

  test('empty file should work with no required fields', async () => {
    const TestPost = defineDocumentType(() => ({
      name: 'TestPost',
      filePathPattern: `**/*.mdx`,
      contentType: 'mdx',
      fields: {},
    }))

    const { result } = await runTest({ documentTypes: [TestPost], contentDirPath, relativeFilePath: 'empty.mdx' })

    expect(result._tag).toBe('Right')
    if (E.isRight(result)) {
      expect(result.right.document).toBeTruthy()
    }
  })

  test('empty file should fail with required fields', async () => {
    const TestPost = defineDocumentType(() => ({
      name: 'TestPost',
      filePathPattern: `**/*.mdx`,
      contentType: 'mdx',
      fields: {
        title: { type: 'string', required: true },
      },
    }))

    const { result } = await runTest({ documentTypes: [TestPost], contentDirPath, relativeFilePath: 'empty.mdx' })

    expect(result._tag).toBe('Left')
    if (E.isLeft(result)) {
      expect(result.left._tag).toBe('MissingRequiredFieldsError')
    }
  })
})

describe('misc-files: empty-json', () => {
  const contentDirPath = path.join(testFileDir, 'fixtures', 'misc-files', 'empty-json')

  test('empty file should fail with no required fields', async () => {
    const TestPost = defineDocumentType(() => ({
      name: 'TestPost',
      filePathPattern: `**/*.json`,
      contentType: 'data',
      fields: {},
    }))

    const { result } = await runTest({ documentTypes: [TestPost], contentDirPath, relativeFilePath: 'empty.json' })

    expect(result._tag).toBe('Left')
    if (E.isLeft(result)) {
      expect(result.left._tag).toBe('InvalidJsonFileError')
    }
  })

  test('empty file should fail with required fields', async () => {
    const TestPost = defineDocumentType(() => ({
      name: 'TestPost',
      filePathPattern: `**/*.json`,
      contentType: 'data',
      fields: {
        title: { type: 'string', required: true },
      },
    }))

    const { result } = await runTest({ documentTypes: [TestPost], contentDirPath, relativeFilePath: 'empty.json' })

    expect(result._tag).toBe('Left')
    if (E.isLeft(result)) {
      expect(result.left._tag).toBe('InvalidJsonFileError')
    }
  })
})

describe('misc-files: empty-yaml', () => {
  const contentDirPath = path.join(testFileDir, 'fixtures', 'misc-files', 'empty-yaml')

  test('empty file should work with no required fields', async () => {
    const TestPost = defineDocumentType(() => ({
      name: 'TestPost',
      filePathPattern: `**/*.yaml`,
      contentType: 'data',
      fields: {},
    }))

    const { result } = await runTest({ documentTypes: [TestPost], contentDirPath, relativeFilePath: 'empty.yaml' })

    expect(result._tag).toBe('Right')
    if (E.isRight(result)) {
      expect(result.right.document).toBeTruthy()
    }
  })

  test('empty file should fail with required fields', async () => {
    const TestPost = defineDocumentType(() => ({
      name: 'TestPost',
      filePathPattern: `**/*.yaml`,
      contentType: 'data',
      fields: {
        title: { type: 'string', required: true },
      },
    }))

    const { result } = await runTest({ documentTypes: [TestPost], contentDirPath, relativeFilePath: 'empty.yaml' })

    expect(result._tag).toBe('Left')
    if (E.isLeft(result)) {
      expect(result.left._tag).toBe('MissingRequiredFieldsError')
    }
  })
})
