import type * as core from '@contentlayer/core'
import { OT, pipe, T } from '@contentlayer/utils/effect'

import { getFieldDef } from '../mapping/index.js'
import type { DatabaseProperties } from '../notion/types.js'
import type { FieldDef } from '../types.js'
import type { DatabaseTypeDef } from './types/database.js'
import { findDatabaseFieldDef } from './utils/findDatabaseFieldDef.js'
import { normalizeKey } from './utils/normalizeKey.js'

export type ProvideFieldDefArgs = {
  property: DatabaseProperties
  databaseTypeDef: DatabaseTypeDef
  getDocumentTypeDef: (databaseTypeDef: DatabaseTypeDef<false>) => T.Effect<unknown, never, core.DocumentTypeDef>
}

export const provideFieldDef = ({ property, databaseTypeDef, getDocumentTypeDef }: ProvideFieldDefArgs) =>
  pipe(
    T.succeed(findDatabaseFieldDef({ databaseTypeDef, property })),
    T.chain((databaseFieldTypeDef) =>
      T.gen(function* ($) {
        const name = databaseFieldTypeDef?.key ?? normalizeKey(property.name)

        return {
          ...(yield* $(getFieldDef({ property, databaseFieldTypeDef, databaseTypeDef, getDocumentTypeDef }))),
          name,
          propertyKey: property.name,
          isSystemField: false,
          description: databaseFieldTypeDef?.description,
          isRequired: databaseFieldTypeDef?.required ?? false,
        } as FieldDef
      }),
    ),
    OT.withSpan('@contentlayer/source-notion/schema:provideFieldDef'),
  )
