import { defineDocument } from 'contentlayer/source-local'

export const person = defineDocument(() => ({
  name: 'person',
  label: 'Person',
  filePathPattern: 'data/authors/*.yaml',
  fields: {
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    bio: { type: 'markdown' },
    photo: { type: 'image' },
  },
}))
