import type { PosixFilePath } from '@contentlayer/utils'
import * as utils from '@contentlayer/utils'
import type { Has } from '@contentlayer/utils/effect'
import { T, tag } from '@contentlayer/utils/effect'
import * as path from 'node:path'

import type { DocumentContentType } from '../schema/defs/index.js'
import type { RawDocumentData } from '../types.js'
import { getFlattenedPath } from './mapping.js'
import type { RawContent } from './types.js'

/** `DocumentContext` is meant as a "container object" that provides useful information when processing a document */
export interface DocumentContext {
  readonly rawContent: RawContent
  readonly relativeFilePath: PosixFilePath
  readonly rawDocumentData: RawDocumentData
}

export const DocumentContext = tag<DocumentContext>(Symbol.for('@contentlayer/source-files/DocumentContext'))

export const provideDocumentContext = (_: DocumentContext) => T.provideService(DocumentContext)(_)
export const makeAndProvideDocumentContext = ({
  rawContent,
  relativeFilePath,
}: Omit<DocumentContext, 'rawDocumentData'>) => {
  const contentType: DocumentContentType = utils.pattern
    .match(rawContent.kind)
    .with('markdown', () => 'markdown' as const)
    .with('mdx', () => 'mdx' as const)
    .otherwise(() => 'data' as const)

  const rawDocumentData: RawDocumentData = {
    sourceFilePath: relativeFilePath,
    sourceFileName: path.basename(relativeFilePath),
    sourceFileDir: path.dirname(relativeFilePath),
    contentType,
    flattenedPath: getFlattenedPath(relativeFilePath),
  }

  return provideDocumentContext({ rawContent, rawDocumentData, relativeFilePath })
}

export const getFromDocumentContext = <K extends keyof DocumentContext>(key: K) =>
  T.accessService(DocumentContext)((_) => _[key])

export type HasDocumentContext = Has<DocumentContext>
