import * as core from '@contentlayer/core'
import * as utils from '@contentlayer/utils'
import { OT, pipe, T } from '@contentlayer/utils/effect'

import { provideDocumentTypeDefMap } from './provideDocumentTypeDefMap.js'
import { provideNestedTypeDefMap } from './provideNestedTypeDefMap.js'
import type { DatabaseTypeDef } from './types.js'

export type ProvideSchemaArgs = {
  databaseTypeDefs: DatabaseTypeDef[]
}

export const provideSchema = ({ databaseTypeDefs }: ProvideSchemaArgs) =>
  pipe(
    T.gen(function* ($) {
      return {
        documentTypeDefMap: yield* $(provideDocumentTypeDefMap({ databaseTypeDefs })),
        nestedTypeDefMap: yield* $(provideNestedTypeDefMap()),
      }
    }),

    T.chain((schemaDef) =>
      pipe(
        utils.hashObject(schemaDef),
        T.map(
          (hash): core.SchemaDef => ({
            ...schemaDef,
            hash,
          }),
        ),
        T.tap((schemaDef) => T.succeed(core.validateSchema(schemaDef))),
      ),
    ),

    T.mapError((error) => new core.SourceProvideSchemaError({ error })),
    OT.withSpan('@contentlayer/source-notion/schema:provideSchema'),
  )
