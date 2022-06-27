import { makeSource } from 'contentlayer/source-files'
import 'contentlayer-stackbit-yaml-generator/types'

import * as documentTypes from './src/contentlayer'

export default makeSource({
  contentDirPath: 'content',
  documentTypes,
  stackbit: {
    pagesDir: 'content/pages',
    dataDir: 'content/data',
  },
})
