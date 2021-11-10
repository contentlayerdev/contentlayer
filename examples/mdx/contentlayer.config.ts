import { defineDocumentType, makeSource } from 'contentlayer/source-files'

const Doc = defineDocumentType(() => ({
  name: 'Doc',
  filePathPattern: '**/*.mdx',
  bodyType: 'mdx',
  fields: {
    titl: { type: 'string', required: true },
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Doc],
  onMissingOrIncompatibleData: 'fail',
})
