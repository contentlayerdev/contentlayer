import type * as core from '@contentlayer/core'
import { OT, pipe, T } from '@contentlayer/utils/effect'

import { provideDocumentTypeDef } from './provideDocumentTypeDef'
import type { DatabaseTypeDef } from './types'

export type ProvideDocumentTypeDefMapArgs = {
  databaseTypeDefs: DatabaseTypeDef[]
}

export const provideDocumentTypeDefMap = ({ databaseTypeDefs }: ProvideDocumentTypeDefMapArgs) =>
  pipe(
    T.gen(function* ($) {
      const documentTypeDefMap: core.DocumentTypeDefMap = {}

      const getDocumentTypeDef = (databaseTypeDef: DatabaseTypeDef) => {
        return databaseTypeDef.name in documentTypeDefMap
          ? T.succeed(documentTypeDefMap[databaseTypeDef.name])
          : pipe(
              provideDocumentTypeDef({ databaseTypeDef }),
              T.tap((documentTypeDef) => T.succeed((documentTypeDefMap[databaseTypeDef.name] = documentTypeDef))),
            )
      }

      for (const databaseTypeDef of databaseTypeDefs) {
        yield* $(getDocumentTypeDef(databaseTypeDef))
      }

      return documentTypeDefMap
    }),
    OT.withSpan('@contentlayer/source-notion/schema:provideDocumentTypeDefMap'),
  )
