import { DocumentDef, fromLocalContent } from 'contentlayer/source-local'
import * as azimuth from './azimuth-schema'
import * as blog from './blog-schema'

export const makeAzimuthSchema = () => makeSchema(azimuth)
export const makeBlogSchema = () => makeSchema(blog)

const makeSchema = (schema: Record<string, () => DocumentDef>) =>
  fromLocalContent({ schema, contentDirPath: '' }).provideSchema()
