import { defineDocumentType, makeSource } from 'contentlayer/source-files'

const Doc = defineDocumentType(() => ({
  name: 'Doc',
  filePathPattern: '**/*.mdx',
  bodyType: 'mdx',
  fields: {
    title: {
      type: 'string',
    },
  },
}))

const contentLayerConfig = makeSource({
  contentDirPath: 'docs',
  documentTypes: [Doc],
})

export default contentLayerConfig
