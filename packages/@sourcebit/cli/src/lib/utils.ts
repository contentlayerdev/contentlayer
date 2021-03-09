import { DocumentDef, DocumentDefMap, ObjectDef, ObjectDefMap } from '@sourcebit/core'
import { promises as fs } from 'fs'

export function derefDocumentOrThrow(documentDefMap: DocumentDefMap, documentDefName: string): DocumentDef {
  if (!(documentDefName in documentDefMap)) {
    throw new Error(`No such DocumentDef "${documentDefName}" in DocumentDefMap: ${JSON.stringify(documentDefMap)}`)
  }

  return documentDefMap[documentDefName]
}

export function derefObjectOrThrow(objectDefMap: ObjectDefMap, objectDefName: string): ObjectDef {
  if (!(objectDefName in objectDefMap)) {
    throw new Error(`No such ObjectDef "${objectDefName}" in ObjectDefMap: ${JSON.stringify(objectDefMap)}`)
  }

  return objectDefMap[objectDefName]
}

export async function fileExists(pathLike: string): Promise<boolean> {
  try {
    const fileStat = await fs.stat(pathLike)
    return fileStat.isFile()
  } catch (_e) {
    return false
  }
}
