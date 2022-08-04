import type { RelativePosixFilePath } from '@contentlayer/utils'
import type { Has } from '@contentlayer/utils/effect'
import { HashMap, O, pipe, State, T, Tagged } from '@contentlayer/utils/effect'

type DocumentTypeName = string

export class DocumentTypeMap extends Tagged('@local/DocumentTypeMap')<{
  readonly map: HashMap.HashMap<DocumentTypeName, RelativePosixFilePath[]>
}> {
  static init = () => new DocumentTypeMap({ map: HashMap.make() })

  add = (documentTypeName: DocumentTypeName, filePath: RelativePosixFilePath) => {
    const oldPaths = pipe(
      HashMap.get_(this.map, documentTypeName),
      O.getOrElse(() => []),
    )

    return new DocumentTypeMap({
      map: HashMap.set_(this.map, documentTypeName, [...oldPaths, filePath]),
    })
  }

  getFilePaths = (documentTypeName: DocumentTypeName): O.Option<RelativePosixFilePath[]> =>
    HashMap.get_(this.map, documentTypeName)
}

/**
 * This state is needed for certain kinds of error handling (e.g. to check if singleton documents have been provided)
 */
export const DocumentTypeMapState = State.State<DocumentTypeMap>(DocumentTypeMap._tag)

export const provideDocumentTypeMapState = T.provideSomeLayer(DocumentTypeMapState.Live(DocumentTypeMap.init()))

export type HasDocumentTypeMapState = Has<State.State<DocumentTypeMap>>
