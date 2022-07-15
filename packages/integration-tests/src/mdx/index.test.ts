/* eslint-disable import/no-extraneous-dependencies */
import * as core from 'contentlayer/core'
import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import * as fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { remarkMdxImages } from 'remark-mdx-images'
import { expect, test, vi } from 'vitest'

test('mdx useRelativeCwd', async () => {
  const Post = defineDocumentType(() => ({
    name: 'Post',
    filePathPattern: 'posts/**/*.mdx',
    contentType: 'mdx',
    fields: {},
  }))

  const spyFn = vi.fn()

  const testDirPath = fileURLToPath(new URL('.', import.meta.url))
  const testOutPath = `${testDirPath}/out`

  await fs.rm(path.join(testDirPath, '.contentlayer'), { recursive: true, force: true })

  process.env['INIT_CWD'] = testDirPath

  const source = await makeSource({
    contentDirPath: path.join(testDirPath, 'content'),
    documentTypes: [Post],
    mdx: {
      remarkPlugins: [remarkMdxImages],
      esbuildOptions: (options) => {
        options.platform = 'node'
        options.outdir = testOutPath
        options.assetNames = `images/[dir]/[name]`
        options.loader = {
          ...options.loader,
          '.png': 'file',
          '.jpg': 'file',
          '.jpeg': 'file',
          '.svg': 'file',
          '.webp': 'file',
          '.gif': 'file'
        }
        options.publicPath = '/'
        options.write = true
        return options
      }
    }
  })

  await core.runMain({ tracingServiceName: 'test', verbose: false })(
    core.generateDotpkg({ config: { source, esbuildHash: 'STATIC_HASH' }, verbose: true }),
  )

  expect(spyFn).toHaveBeenCalledOnce()

  // TODO Check for the output file, images/posts/test-image.png
})
