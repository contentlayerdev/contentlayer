/* eslint-disable import/no-extraneous-dependencies */
import * as fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { absolutePosixFilePath } from '@contentlayer/utils'
import * as core from 'contentlayer/core'
import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import { expect, test } from 'vitest'

test('mdx-image-field ', async () => {
  const Post = defineDocumentType(() => ({
    name: 'Post',
    filePathPattern: 'posts/*.md',
    contentType: 'markdown',
    fields: {
      coverImage: { type: 'image' },
    },
  }))

  const testDirPath = fileURLToPath(new URL('.', import.meta.url))

  const generatedContentlayerDirPath = path.join(testDirPath, '.contentlayer')

  await fs.rm(generatedContentlayerDirPath, { recursive: true, force: true })

  process.env['PWD'] = testDirPath

  const source = await makeSource({
    contentDirPath: path.join(testDirPath, 'content'),
    documentTypes: [Post],
  })(undefined)

  await core.runMain({ tracingServiceName: 'contentlayer-test', verbose: false })(
    core.generateDotpkg({
      config: { source, esbuildHash: 'STATIC_HASH', filePath: absolutePosixFilePath('/not/used') },
      verbose: true,
    }),
  )

  const allPosts = await fs
    .readFile(path.join(generatedContentlayerDirPath, 'generated', 'Post', '_index.json'), 'utf8')
    .then((json) => JSON.parse(json))

  expect(allPosts[0].coverImage).toMatchInlineSnapshot(`
    {
      "aspectRatio": 1.3333333333333333,
      "blurhashDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAACVBMVEV8Ou5vNNN3OeJauo57AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAHUlEQVR4nGNgwAIYGRkhDCZGJqgAE0SIiQmEsAAAAyMAF5ferjEAAAAASUVORK5CYII=",
      "filePath": "posts/image-a.png",
      "format": "png",
      "height": 480,
      "relativeFilePath": "image-a.png",
      "width": 640,
    }
  `)
})
