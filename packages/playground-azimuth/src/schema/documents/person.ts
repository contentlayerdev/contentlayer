import { defineDocument } from '@sourcebit/sdk'

export const person = defineDocument({
  name: 'person',
  label: 'Person',
  // folder: 'authors',
  filePathPattern: 'content/data/authors/*.yaml',
  fields: [
    { type: 'string', name: 'first_name' },
    { type: 'string', name: 'last_name' },
    { type: 'markdown', name: 'bio' },
    { type: 'image', name: 'photo' },
  ],
})
