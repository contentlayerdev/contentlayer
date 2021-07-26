import { fromLocalContent } from 'contentlayer/source-local'
import * as path from 'path'

import * as schema from './src/contentlayer'

export default fromLocalContent({
  contentDirPath: path.join(process.cwd(), 'content'),
  schema,
})
