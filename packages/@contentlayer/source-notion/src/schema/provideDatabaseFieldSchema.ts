import type { OT } from '@contentlayer/utils/effect'
import { pipe, T } from '@contentlayer/utils/effect'

import { getFieldFunctions } from '../mapping/index.js'
import type { DatabaseProperties, FieldDef } from '../types.js'
import type { ProvideDatabaseSchemaArgs } from './provideDatabaseSchema.js'
import type { DatabaseTypeDef } from './types.js'
import { findDatabaseFieldDef } from './utils/findDatabaseFieldDef.js'
import { normalizeKey } from './utils/normalizeKey.js'

export type ProvideDatabaseFieldSchemaArgs = {
  property: DatabaseProperties
  databaseTypeDef: DatabaseTypeDef
} & Omit<ProvideDatabaseSchemaArgs, 'databaseTypeDef'>

export const provideDatabaseFieldSchema = ({
  property,
  databaseTypeDef,
  ...rest
}: ProvideDatabaseFieldSchemaArgs): T.Effect<OT.HasTracer, unknown, FieldDef | undefined> =>
  pipe(
    T.succeed(findDatabaseFieldDef({ databaseTypeDef, property })),
    T.chain((databaseFieldTypeDef) =>
      pipe(
        T.succeed(
          getFieldFunctions(property.type)?.getFieldDef({ property, databaseFieldTypeDef, databaseTypeDef, ...rest }),
        ),
        T.map((def) => {
          if (!def) return // TODO : Find a more beautiful way using ts-effects

          const name = normalizeKey(databaseFieldTypeDef?.key ?? property.name)

          return {
            ...def,
            name,
            propertyKey: property.name,
            isSystemField: false,
            description: databaseFieldTypeDef?.description,
            isRequired: databaseFieldTypeDef?.isRequired ?? false,
          } as FieldDef
        }),
      ),
    ),
  )
