import { DocumentGen } from 'contentlayer/core'

export function urlFromFilePath(doc: DocumentGen): string {
  const url = doc._id
    .replace('pages', '')
    .replace(/\.md$/, '')
    .replace(/\index$/, '')

  return url
}
