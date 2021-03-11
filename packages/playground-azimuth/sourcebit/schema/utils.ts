import { Document } from '@sourcebit/core'

export function urlFromFilePath(doc: Omit<Document, '__computed'>): string {
  const url = doc.__meta.sourceFilePath
    .replace('content/pages/', '')
    .replace(/\.md$/, '')
    .replace(/\/?index$/, '')

  if (url === '') {
    return '/'
  }

  return url
}
