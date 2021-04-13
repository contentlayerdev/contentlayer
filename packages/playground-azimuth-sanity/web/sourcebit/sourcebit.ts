import { makeSourcePlugin } from '@contentlayer/source-sanity'
import { defineConfig } from 'contentlayer/core'
import * as path from 'path'

export default defineConfig({
  source: makeSourcePlugin({
    studioDirPath: path.join(process.cwd(), '..', 'studio'),
    preview: true,
  }),
})
