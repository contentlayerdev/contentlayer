import type { Document } from 'contentlayer/core'

export function urlFromFilePath(doc: Document): string {
  const url = doc._id
    .replace('pages', '')
    .replace(/\.md$/, '')
    .replace(/\index$/, '')

  return url
}
