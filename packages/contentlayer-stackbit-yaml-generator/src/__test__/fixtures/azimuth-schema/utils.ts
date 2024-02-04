import type { DocumentGen } from 'contentlayer-temp/core'

export const urlFromFilePath = (doc: DocumentGen): string => doc._raw.flattenedPath.replace(/pages\/?/, '')
