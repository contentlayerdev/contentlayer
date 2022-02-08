import type { PosixFilePath } from '@contentlayer/utils'
import type { Has } from '@contentlayer/utils/effect'
import { T, tag } from '@contentlayer/utils/effect'

import type { RawContent } from './types.js'

export interface DocumentContext {
  readonly rawContent: RawContent
  readonly relativeFilePath: PosixFilePath
}

export const DocumentContext = tag<DocumentContext>(Symbol.for('@contentlayer/source-files/DocumentContext'))

export const provideDocumentContext = (_: DocumentContext) => T.provideService(DocumentContext)(_)

export const getFromDocumentContext = <K extends keyof DocumentContext>(key: K) =>
  T.accessService(DocumentContext)((_) => _[key])

export type HasDocumentContext = Has<DocumentContext>
