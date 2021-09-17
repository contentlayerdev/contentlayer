import { JaegerNodeTracing } from '@contentlayer/utils'
import { pipe, T } from '@contentlayer/utils/effect'
import type { DocumentType } from 'contentlayer/source-files'
import { makeSource } from 'contentlayer/source-files'

import * as azimuth from './azimuth-schema'
import * as blog from './blog-schema'

export const makeAzimuthSchema = () => makeSchema(azimuth)
export const makeBlogSchema = () => makeSchema(blog)

const makeSchema = (documentTypes: Record<string, DocumentType<any>>) =>
  pipe(
    T.tryPromise(() => makeSource({ documentTypes, contentDirPath: '' })),
    T.chain((source) => source.provideSchema),
    T.provideSomeLayer(JaegerNodeTracing('contentlayer-cli')),
    T.runPromise,
  )
