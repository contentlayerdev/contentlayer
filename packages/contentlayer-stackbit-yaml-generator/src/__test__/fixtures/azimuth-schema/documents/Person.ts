import { defineDocumentType } from 'contentlayer2/source-files'

export const Person = defineDocumentType(() => ({
  name: 'Person',
  filePathPattern: 'data/authors/*.yaml',
  fields: {
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    bio: { type: 'markdown' },
    photo: { type: 'string' },
  },
  extensions: {
    stackbit: { folder: 'authors' },
  },
}))
