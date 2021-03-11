import { defineConfig } from '@sourcebit/core'
import { makeSourcePlugin } from '@sourcebit/source-sanity'
import * as path from 'path'

export default defineConfig({
  source: makeSourcePlugin({
    studioDirPath: path.join(__dirname, '..', '..', 'studio'),
  }),
})
