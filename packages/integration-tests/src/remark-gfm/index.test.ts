/* eslint-disable import/no-extraneous-dependencies */
import * as fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { absolutePosixFilePath } from '@contentlayer2/utils'
import * as core from 'contentlayer2/core'
import { defineDocumentType, makeSource } from 'contentlayer2/source-files'
import remarkGfm from 'remark-gfm'
import { expect, test } from 'vitest'

const configFilePath = absolutePosixFilePath('/not/used')

test('mdx - remarkGfm plugin integration', async () => {
  const Post = defineDocumentType(() => ({
    name: 'Post',
    filePathPattern: 'posts/*.mdx',
    contentType: 'mdx',
    fields: {},
  }))

  const testDirPath = fileURLToPath(new URL('.', import.meta.url))

  await fs.rm(path.join(testDirPath, '.contentlayer'), { recursive: true, force: true })

  process.env['PWD'] = testDirPath

  const source = await makeSource({
    contentDirPath: path.join(testDirPath, 'content'),
    documentTypes: [Post],
    mdx: {
      resolveCwd: 'contentDirPath',
      remarkPlugins: [remarkGfm],
    },
  })(undefined)

  await core.runMain({ tracingServiceName: 'contentlayer-test', verbose: false })(
    core.generateDotpkg({ config: { source, esbuildHash: 'STATIC_HASH', filePath: configFilePath }, verbose: true }),
  )

  const generatedIndexJsonFile = await fs.readFile(
    path.join(testDirPath, '.contentlayer', 'generated', 'Post', '_index.json'),
    'utf8',
  )

  expect(generatedIndexJsonFile.length).toBeGreaterThan(0)
})
