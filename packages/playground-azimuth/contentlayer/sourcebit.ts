import { defineConfig } from 'contentlayer/core'
import { makeSourcePlugin } from 'contentlayer/source-local'
import * as path from 'path'
import * as documentDefs from './schema'

export default defineConfig({
  source: makeSourcePlugin({
    documentDefs,
    contentDirPath: path.join(process.cwd(), 'contentlayer', 'content'),
  }),
})
