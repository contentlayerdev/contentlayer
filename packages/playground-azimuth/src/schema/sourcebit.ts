import { defineConfig } from '@sourcebit/core'
import { makeSourcePlugin } from '@sourcebit/source-local'
import { blog } from './documents/blog'
import { landing } from './documents/landing'
import { page } from './documents/page'
import { person } from './documents/person'
import { post } from './documents/post'
import { site_config } from './documents/site_config'

export default defineConfig({
  source: makeSourcePlugin({
    documentDefs: [blog, site_config, landing, page, person, post],
    contentGlob: 'content/**/*.{md,json,yaml}',
  }),
})
