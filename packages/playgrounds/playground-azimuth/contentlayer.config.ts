import { makeSource } from 'contentlayer/source-files'

import * as documentTypes from './src/contentlayer'

export default makeSource({
  contentDirPath: 'content',
  documentTypes,
  extensions: {
    stackbit: {
      pagesDir: 'content/pages',
      dataDir: 'content/data',
    },
  },
})
