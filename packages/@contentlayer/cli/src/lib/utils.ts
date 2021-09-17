// TODO Note this seems to be unused and should be deleted soon
import type { DocumentTypeDef, DocumentTypeDefMap, NestedTypeDef, NestedTypeDefMap } from '@contentlayer/core'

export const derefDocumentOrThrow = (documentDefMap: DocumentTypeDefMap, documentDefName: string): DocumentTypeDef => {
  if (!(documentDefName in documentDefMap)) {
    throw new Error(
      `No such DocumentTypeDef "${documentDefName}" in DocumentTypeDefMap: ${JSON.stringify(documentDefMap)}`,
    )
  }

  return documentDefMap[documentDefName]!
}

export const derefEmbeddedOrThrow = (nestedTypeDefMap: NestedTypeDefMap, nestedTypeDefName: string): NestedTypeDef => {
  if (!(nestedTypeDefName in nestedTypeDefMap)) {
    throw new Error(
      `No such NestedTypeDef "${nestedTypeDefName}" in NestedTypeDefMap: ${JSON.stringify(nestedTypeDefMap)}`,
    )
  }

  return nestedTypeDefMap[nestedTypeDefName]!
}
