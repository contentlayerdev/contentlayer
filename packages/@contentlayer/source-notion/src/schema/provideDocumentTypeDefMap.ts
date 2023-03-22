import type * as core from '@contentlayer/core'
import { OT, pipe, T } from '@contentlayer/utils/effect'

import { provideDocumentTypeDef } from './provideDocumentTypeDef.js'
import type { DatabaseTypeDef } from './types.js'
import { flattendDatabaseTypeDef } from './utils/flattenDatabaseTypeDef.js'

export type ProvideDocumentTypeDefMapArgs = {
  databaseTypeDefs: DatabaseTypeDef<false>[]
  options: core.PluginOptions
}

export const provideDocumentTypeDefMap = ({ databaseTypeDefs, options }: ProvideDocumentTypeDefMapArgs) =>
  pipe(
    T.gen(function* ($) {
      const documentTypeDefMap: core.DocumentTypeDefMap = {}

      // .map((databaseTypeDef) => ({
      //   ...databaseTypeDef,
      //   fields: databaseTypeDef.fields
      //     ? Array.isArray(databaseTypeDef.fields)
      //       ? databaseTypeDef.fields
      //       : Object.entries(databaseTypeDef.fields).map(([key, field]) => ({
      //           key,
      //           ...field,
      //         }))
      //     : [],
      // }))

      const getDocumentTypeDef = (databaseTypeDef: DatabaseTypeDef<false>) => {
        return databaseTypeDef.name in documentTypeDefMap
          ? T.succeed(documentTypeDefMap[databaseTypeDef.name])
          : pipe(
              provideDocumentTypeDef({
                databaseTypeDef: flattendDatabaseTypeDef(databaseTypeDef),
                getDocumentTypeDef,
                options,
              }),
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
