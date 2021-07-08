import type { Document } from 'contentlayer/core'

export const urlFromFilePath = (doc: Document): string => doc._raw.flattenedPath.replace('pages', '')
