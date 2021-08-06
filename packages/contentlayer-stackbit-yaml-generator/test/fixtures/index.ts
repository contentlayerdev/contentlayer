import type { DocumentType } from 'contentlayer/source-files'
import { makeSource } from 'contentlayer/source-files'

import * as azimuth from './azimuth-schema'
import * as blog from './blog-schema'

export const makeAzimuthSchema = () => makeSchema(azimuth)
export const makeBlogSchema = () => makeSchema(blog)

const makeSchema = (documentTypes: Record<string, DocumentType<any>>) =>
  makeSource({ documentTypes, contentDirPath: '' }).then((_) => _.provideSchema())
