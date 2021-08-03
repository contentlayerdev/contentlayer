import { defineDocumentType } from 'contentlayer/source-local'

export const Person = defineDocumentType(() => ({
  name: 'Person',
  filePathPattern: 'data/authors/*.yaml',
  bodyType: 'none',
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
