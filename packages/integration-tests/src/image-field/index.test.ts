/* eslint-disable import/no-extraneous-dependencies */
import * as fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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
  })

  await core.runMain({ tracingServiceName: 'contentlayer-test', verbose: false })(
    core.generateDotpkg({ config: { source, esbuildHash: 'STATIC_HASH' }, verbose: true }),
  )

  const allPosts = await fs
    .readFile(path.join(generatedContentlayerDirPath, 'generated', 'Post', '_index.json'), 'utf8')
    .then((json) => JSON.parse(json))

  expect(allPosts[0].coverImage).toMatchInlineSnapshot(`
    {
      "blurhashDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAACXBIWXMAAAsTAAALEwEAmpwYAAAArklEQVR4nF2OSw6CQBBEuZKGwfl4Io1BNqAMwwV1YTRGl4gLI3+8QJludeOiU13J6+ryMlPjMxWsqVjZzytY2cEjY1UDpwfk5sVKnoFggJfphi8iccViskMkLt/EGqkY4RGd6wGJKrEOTohlgdyMsJoATmgR+mes/ANS80AojlhO93Cm/QENNuqOeHbDVj6RyBKxKpCZ5vOCfjndwekelEbKO5fsqUPLrf+Hkgl4A4q9pmrNTiK/AAAAAElFTkSuQmCC",
      "filePath": "posts/image-a.png",
      "format": "png",
      "height": 480,
      "relativeFilePath": "image-a.png",
      "width": 640,
    }
  `)
})
