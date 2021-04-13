import { DocumentDef, DocumentDefMap, ObjectDef, ObjectDefMap } from '@contentlayer/core'

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
