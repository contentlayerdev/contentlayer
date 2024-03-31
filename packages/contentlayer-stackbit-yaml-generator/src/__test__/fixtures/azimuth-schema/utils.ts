import type { DocumentGen } from 'contentlayer2/core'

export const urlFromFilePath = (doc: DocumentGen): string => doc._raw.flattenedPath.replace(/pages\/?/, '')
