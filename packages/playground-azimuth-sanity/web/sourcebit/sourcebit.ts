import { makeSourcePlugin } from '@sourcebit/source-sanity'
import * as path from 'path'
import { defineConfig } from 'sourcebit/core'

export default defineConfig({
  source: makeSourcePlugin({
    studioDirPath: path.join(process.cwd(), '..', 'studio'),
    preview: true,
  }),
})
