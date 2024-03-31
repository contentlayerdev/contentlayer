import { provideJaegerTracing } from '@contentlayer2/utils'
import { pipe, provideConsole, T } from '@contentlayer2/utils/effect'
import type { DocumentType } from 'contentlayer2/source-files'
import { makeSource } from 'contentlayer2/source-files'

import * as azimuth from './azimuth-schema/index.js'
import * as blog from './blog-schema/index.js'

export const makeAzimuthSchema = () => makeSchema(azimuth)
export const makeBlogSchema = () => makeSchema(blog)

const esbuildHash = 'not-important-for-this-test'

const makeSchema = (documentTypes: Record<string, DocumentType<any>>) =>
  pipe(
    T.tryPromise(() => makeSource({ documentTypes, contentDirPath: '' })(undefined)),
    T.chain((source) => source.provideSchema(esbuildHash)),
    provideJaegerTracing('contentlayer-cli'),
    provideConsole,
    T.runPromise,
  )
