import * as core from '@contentlayer/core'
import * as utils from '@contentlayer/utils'
import { OT, pipe, T } from '@contentlayer/utils/effect'

import { provideDocumentTypeDefMap } from './provideDocumentTypeDefMap.js'
import { provideNestedTypeDefMap } from './provideNestedTypeDefMap.js'
import type { DatabaseTypeDef } from './types/database.js'

export type ProvideSchemaArgs = {
  databaseTypeDefs: DatabaseTypeDef<false>[]
  options: core.PluginOptions
}

export const provideSchema = ({ databaseTypeDefs, options }: ProvideSchemaArgs) =>
  pipe(
    T.gen(function* ($) {
      return {
        documentTypeDefMap: yield* $(provideDocumentTypeDefMap({ databaseTypeDefs, options })),
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
