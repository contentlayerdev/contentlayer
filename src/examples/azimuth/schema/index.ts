import { defineSchema } from '../../../lib/schema'
import { blog } from './documents/blog'
import { config } from './documents/config'
import { landing } from './documents/landing'
import { page } from './documents/page'
import { person } from './documents/person'
import { post } from './documents/post'

export default defineSchema({
  documents: [blog, config, landing, page, person, post],
})
