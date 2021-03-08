import { defineSchema } from '@sourcebit/sdk'
import { blog } from './documents/blog'
import { landing } from './documents/landing'
import { page } from './documents/page'
import { person } from './documents/person'
import { post } from './documents/post'
import { site_config } from './documents/site_config'

export default defineSchema({
  documents: [blog, site_config, landing, page, person, post],
  cms: 'Contentful',
  ssg: 'Hugo',
})
