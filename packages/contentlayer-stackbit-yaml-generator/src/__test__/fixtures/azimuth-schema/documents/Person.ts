import { defineDocumentType } from 'contentlayer/source-files'

export const Person = defineDocumentType(() => ({
  name: 'Person',
  filePathPattern: 'data/authors/*.yaml',
  fields: {
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    bio: { type: 'markdown' },
    photo: { type: 'string' },
  },
  stackbit: { folder: 'authors' },
}))
