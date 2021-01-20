import { document } from '../../../lib/schema'

export const person = document({
  name: 'person',
  label: 'Person',
  folder: 'authors',
  fields: [
    {
      type: 'string',
      name: 'first_name',
    },
    {
      type: 'string',
      name: 'last_name',
    },
    {
      type: 'markdown',
      name: 'bio',
    },
    {
      type: 'image',
      name: 'photo',
    },
  ],
})
