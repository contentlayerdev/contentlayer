import type { DocumentType } from 'contentlayer/source-local'
import { fromLocalContent } from 'contentlayer/source-local'

import * as azimuth from './azimuth-schema'
import * as blog from './blog-schema'

export const makeAzimuthSchema = () => makeSchema(azimuth)
export const makeBlogSchema = () => makeSchema(blog)

const makeSchema = (documentTypes: Record<string, DocumentType<any>>) =>
  fromLocalContent({ documentTypes, contentDirPath: '' }).then((_) => _.provideSchema())
