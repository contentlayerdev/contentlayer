import * as path from 'path'
import { defineConfig } from 'sourcebit/core'
import { makeSourcePlugin } from 'sourcebit/source-local'
import * as documentDefs from './schema'

export default defineConfig({
  source: makeSourcePlugin({
    documentDefs,
    contentDirPath: path.join(process.cwd(), 'sourcebit', 'content'),
  }),
})
