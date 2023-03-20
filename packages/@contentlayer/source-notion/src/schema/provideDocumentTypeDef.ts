import type * as core from '@contentlayer/core'
import { OT, pipe, T } from '@contentlayer/utils/effect'

import { NotionClient } from '../services.js'
import type { FieldDef } from '../types.js'
import { provideFieldDef } from './provideFieldDef.js'
import type { DatabaseTypeDef } from './types.js'

export type ProvideDocumentTypeDefArgs = {
  databaseTypeDef: DatabaseTypeDef
  getDocumentTypeDef: (databaseTypeDef: DatabaseTypeDef<false>) => T.Effect<unknown, never, core.DocumentTypeDef>
}

export const provideDocumentTypeDef = ({ databaseTypeDef, getDocumentTypeDef }: ProvideDocumentTypeDefArgs) =>
  pipe(
    T.service(NotionClient),
    T.chain((client) =>
      pipe(
        T.tryPromise(() => client.databases.retrieve({ database_id: databaseTypeDef.databaseId })),
        T.map(({ properties }) => Object.values(properties)),
        T.chain((properties) =>
          T.forEachPar_(properties, (property) => provideFieldDef({ databaseTypeDef, property, getDocumentTypeDef })),
        ),
      ),
    ),
    T.chain((fieldDefs) =>
      pipe(
        T.filterPar_(fieldDefs, (fieldDef) => T.succeed(!!fieldDef)), // Check if it should fail
        T.map(
          (fieldDefs) =>
            ({
              _tag: 'DocumentTypeDef' as const,
              name: databaseTypeDef.name,
              description: databaseTypeDef.description,
              isSingleton: false,
              fieldDefs: [...fieldDefs] as FieldDef[], // TODO : Find a more beautiful way
              computedFields: [],
              extensions: {},
            } as core.DocumentTypeDef),
        ),
      ),
    ),

    OT.withSpan('@contentlayer/source-notion/schema:provideDocumentTypeDef'),
  )
