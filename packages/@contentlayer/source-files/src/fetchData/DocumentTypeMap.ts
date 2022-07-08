import type { PosixFilePath } from '@contentlayer/utils'
import type { Has, Option, These } from '@contentlayer/utils/effect'
import { HashMap, O, pipe, State, T, Tagged, Tuple } from '@contentlayer/utils/effect'

export type DocumentTypeName = string

export class DocumentTypeMap extends Tagged('@local/DocumentTypeMap')<{
  readonly map: HashMap.HashMap<DocumentTypeName, PosixFilePath[]>
}> {
  static init = () => new DocumentTypeMap({ map: HashMap.make() })

  add = (documentTypeName: DocumentTypeName, filePath: PosixFilePath) => {
    const oldPaths = pipe(
      HashMap.get_(this.map, documentTypeName),
      O.getOrElse(() => []),
    )

    return new DocumentTypeMap({
      map: HashMap.set_(this.map, documentTypeName, [...oldPaths, filePath]),
    })
  }

  getFilePaths = (documentTypeName: DocumentTypeName): O.Option<PosixFilePath[]> =>
    HashMap.get_(this.map, documentTypeName)
}

/**
 * This state is needed for certain kinds of error handling (e.g. to check if singleton documents have been provided)
 */
export const DocumentTypeMapState = State.State<DocumentTypeMap>(DocumentTypeMap._tag)

export const serialize = () =>
  pipe(
    DocumentTypeMapState.get,
    // FIXME: unsafe
    T.chain((map) => T.succeedWith(() => JSON.stringify(map))),
  )

export function provideFromSerialized(serialized: string) {
  return pipe(
    // FIXME: unsafe
    T.succeedWith<DocumentTypeMap>(() => JSON.parse(serialized)),
    T.map((map) => T.provideSomeLayer(DocumentTypeMapState.Live(new DocumentTypeMap(map)))),
  )
}

export const provideDocumentTypeMapState = T.provideSomeLayer(DocumentTypeMapState.Live(DocumentTypeMap.init()))

export type HasDocumentTypeMapState = Has<State.State<DocumentTypeMap>>
