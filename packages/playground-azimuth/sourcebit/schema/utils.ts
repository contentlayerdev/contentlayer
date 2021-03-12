import { DocumentGen } from '@sourcebit/core'

export function urlFromFilePath(doc: DocumentGen): string {
  const url = doc.__meta.sourceFilePath
    .replace('pages', '')
    .replace(/\.md$/, '')
    .replace(/\index$/, '')

  return url
}
