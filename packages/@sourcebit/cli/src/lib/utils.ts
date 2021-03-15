import { DocumentDef, DocumentDefMap, ObjectDef, ObjectDefMap } from '@sourcebit/core'
import { promises as fs } from 'fs'
import * as path from 'path'

export const derefDocumentOrThrow = (documentDefMap: DocumentDefMap, documentDefName: string): DocumentDef => {
  if (!(documentDefName in documentDefMap)) {
    throw new Error(`No such DocumentDef "${documentDefName}" in DocumentDefMap: ${JSON.stringify(documentDefMap)}`)
  }

  return documentDefMap[documentDefName]
}

export const derefObjectOrThrow = (objectDefMap: ObjectDefMap, objectDefName: string): ObjectDef => {
  if (!(objectDefName in objectDefMap)) {
    throw new Error(`No such ObjectDef "${objectDefName}" in ObjectDefMap: ${JSON.stringify(objectDefMap)}`)
  }

  return objectDefMap[objectDefName]
}

export const fileExists = async (pathLike: string): Promise<boolean> => {
  try {
    const fileStat = await fs.stat(pathLike)
    return fileStat.isFile()
  } catch (_e) {
    return false
  }
}

export const makeArtifactsDir = async (): Promise<string> => {
  const artifactsDirPath = path.join('node_modules', '.sourcebit')
  await fs.mkdir(artifactsDirPath, { recursive: true })
  return artifactsDirPath
}
