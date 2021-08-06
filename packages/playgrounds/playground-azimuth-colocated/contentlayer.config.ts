import { makeSource } from 'contentlayer/source-files'
import * as path from 'path'

import * as schema from './src/contentlayer'

export default makeSource({
  contentDirPath: path.join(process.cwd(), 'content'),
  schema,
})
