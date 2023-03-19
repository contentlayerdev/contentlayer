import { OT, pipe, T } from '@contentlayer/utils/effect'

import { getFieldFunctions } from '../mapping/index.js'
import type { DatabaseProperties, FieldDef } from '../types.js'
import type { DatabaseTypeDef } from './types.js'
import { findDatabaseFieldDef } from './utils/findDatabaseFieldDef.js'
import { normalizeKey } from './utils/normalizeKey.js'

export type ProvideFieldDefArgs = {
  property: DatabaseProperties
  databaseTypeDef: DatabaseTypeDef
}

export const provideFieldDef = ({ property, databaseTypeDef }: ProvideFieldDefArgs) =>
  pipe(
    T.succeed(findDatabaseFieldDef({ databaseTypeDef, property })),
    T.chain((databaseFieldTypeDef) =>
      pipe(
        getFieldFunctions(property.type),
        T.chain((fieldDefFunction) =>
          T.gen(function* ($) {
            if (!fieldDefFunction) return // TODO : Find a more beautiful way using ts-effects
            const name = normalizeKey(databaseFieldTypeDef?.key ?? property.name)

            return {
              ...(yield* $(fieldDefFunction.getFieldDef({ property, databaseFieldTypeDef, databaseTypeDef }))),
              name,
              propertyKey: property.name,
              isSystemField: false,
              description: databaseFieldTypeDef?.description,
              isRequired: databaseFieldTypeDef?.isRequired ?? false,
            } as FieldDef
          }),
        ),
      ),
    ),
    T.catchAll(() => T.succeed(undefined)), // TODO : Better error handling
    OT.withSpan('@contentlayer/source-notion/schema:provideFieldDef'),
  )
