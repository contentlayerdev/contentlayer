import { defineDocument } from '../../../../lib/schema'

export const person = defineDocument({
  name: 'person',
  label: 'Person',
  folder: 'authors',
  fields: [
    { type: 'string', name: 'first_name' },
    { type: 'string', name: 'last_name' },
    { type: 'markdown', name: 'bio' },
    { type: 'image', name: 'photo' },
  ],
})
