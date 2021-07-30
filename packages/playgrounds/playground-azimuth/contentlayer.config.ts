import { fromLocalContent } from 'contentlayer/source-local'
import * as path from 'path'

import * as documentTypes from './src/contentlayer'

export default fromLocalContent({
  contentDirPath: path.join(process.cwd(), 'content'),
  documentTypes,
  extensions: {
    stackbit: {
      pagesDir: 'content/pages',
      dataDir: 'content/data',
    },
  },
})
