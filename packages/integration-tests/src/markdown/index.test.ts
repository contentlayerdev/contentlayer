/* eslint-disable import/no-extraneous-dependencies */
import * as fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { absolutePosixFilePath } from '@contentlayer/utils'
import * as core from 'contentlayer/core'
import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import rehypeStringify from 'rehype-stringify'
import remarkFrontmatter from 'remark-frontmatter'
import remarkParse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import { expect, test, vi } from 'vitest'

const configFilePath = absolutePosixFilePath('/not/used')

test('markdown builder pattern', async () => {
  const Post = defineDocumentType(() => ({
    name: 'Post',
    filePathPattern: '**/*.md',
    fields: {},
  }))

  const spyFn = vi.fn()

  const testDirPath = fileURLToPath(new URL('.', import.meta.url))

  await fs.rm(path.join(testDirPath, '.contentlayer'), { recursive: true, force: true })

  process.env['PWD'] = testDirPath

  const source = await makeSource({
    contentDirPath: path.join(testDirPath, 'posts'),
    documentTypes: [Post],
    markdown: (builder) => {
      builder
        .use(remarkFrontmatter)
        .use(remarkParse as any)
        .use(remark2rehype)
        .use(rehypeStringify as any)

      spyFn()
    },
  })(undefined)

  await core.runMain({ tracingServiceName: 'contentlayer-test', verbose: false })(
    core.generateDotpkg({ config: { source, esbuildHash: 'STATIC_HASH', filePath: configFilePath }, verbose: true }),
  )

  expect(spyFn).toHaveBeenCalledOnce()
})
