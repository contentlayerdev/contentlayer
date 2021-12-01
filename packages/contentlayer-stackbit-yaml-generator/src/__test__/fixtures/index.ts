import { provideJaegerTracing } from '@contentlayer/utils'
import { pipe, provideConsole, T } from '@contentlayer/utils/effect'
import type { DocumentType } from 'contentlayer/source-files'
import { makeSource } from 'contentlayer/source-files'

import * as azimuth from './azimuth-schema/index.js'
import * as blog from './blog-schema/index.js'

export const makeAzimuthSchema = () => makeSchema(azimuth)
export const makeBlogSchema = () => makeSchema(blog)

const makeSchema = (documentTypes: Record<string, DocumentType<any>>) =>
  pipe(
    T.tryPromise(() => makeSource({ documentTypes, contentDirPath: '' })),
    T.chain((source) => source.provideSchema),
    provideJaegerTracing('contentlayer-cli'),
    provideConsole,
    T.runPromise,
  )
