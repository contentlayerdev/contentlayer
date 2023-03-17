import type { DocumentTypeDefMap } from '@contentlayer/core'
import * as core from '@contentlayer/core'
import * as utils from '@contentlayer/utils'
import { OT, pipe, T } from '@contentlayer/utils/effect'
import type * as notion from '@notionhq/client'

import { provideDatabaseSchema } from './provideDatabaseSchema.js'
import type * as LocalSchema from './types.js'

export type ProvideSchemaArgs = {
  client: notion.Client
  databaseTypeDefs: LocalSchema.DatabaseTypeDef[]
  options: core.PluginOptions
}

export const provideSchema = ({
  client,
  databaseTypeDefs,
  ...rest
}: ProvideSchemaArgs): T.Effect<OT.HasTracer, core.SourceProvideSchemaError, core.SchemaDef> =>
  pipe(
    T.gen(function* ($) {
      const documentTypeDefMap: DocumentTypeDefMap = {}

      for (const databaseTypeDef of databaseTypeDefs) {
        documentTypeDefMap[databaseTypeDef.name] = yield* $(
          provideDatabaseSchema({ client, databaseTypeDef, databaseTypeDefs, documentTypeDefMap, ...rest }),
        )
      }

      return documentTypeDefMap
    }),

    // Generates Schema definition without hash
    T.map(
      (documentTypeDefMap): Omit<core.SchemaDef, 'hash'> => ({
        documentTypeDefMap,
        nestedTypeDefMap: {},
      }),
    ),

    // Generate hash using Schema definition and include it
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

    OT.withSpan('@contentlayer/source-notion/schema:provideSchema'),

    T.mapError((error) => new core.SourceProvideSchemaError({ error })),
  )
