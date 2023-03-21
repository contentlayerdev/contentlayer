import { pipe, T } from '@contentlayer/utils/effect'

import { findDatabaseFieldDef } from '../schema/utils/findDatabaseFieldDef.js'
import type { FieldDef } from '../types.js'
import type { FieldFunctions } from '.'
import { getFieldData } from './index.js'

export const fieldRollup: FieldFunctions<'rollup'> = {
  getFieldDef: ({ propertyData, databaseTypeDef, getDocumentTypeDef }) =>
    T.gen(function* ($) {
      const relationFieldDef = findDatabaseFieldDef({
        databaseTypeDef,
        property: { id: propertyData.relation_property_id, name: propertyData.relation_property_name },
      })

      if (!relationFieldDef || !('type' in relationFieldDef) || relationFieldDef.type !== 'relation')
        throw new Error('Field not configured properly')

      const relationDatabaseTypeDef = yield* $(getDocumentTypeDef(relationFieldDef.relation.def()))
      const fieldDef = (relationDatabaseTypeDef.fieldDefs as FieldDef[]).find(
        (fieldDef) => fieldDef.propertyKey === propertyData.rollup_property_name,
      )

      if (!fieldDef) throw new Error('Field not configured properly')

      if (['show_original', 'show_unique'].includes(propertyData.function)) {
        if (
          fieldDef.type === 'reference' ||
          fieldDef.type === 'list_polymorphic' ||
          fieldDef.type === 'nested_polymorphic' ||
          fieldDef.type === 'reference_polymorphic'
        ) {
          throw new Error(`Rollup field of type ${fieldDef.type}`)
        }

        if (fieldDef.type === 'list') {
          return {
            type: 'list',
            of: {
              ...fieldDef.of,
            },
          }
        }

        return {
          type: 'list',
          of: {
            ...fieldDef,
          },
        }
      }

      return fieldDef
    }),
  getFieldData: ({ propertyData, ...args }) =>
    T.gen(function* ($) {
      if (propertyData.type === 'array') {
        const res = yield* $(
          pipe(
            T.forEach_(propertyData.array, (property) =>
              getFieldData({ ...args, property: { ...property, id: 'unknown' } }),
            ),

            // As Contentlayer does not support list of list, we have to reduce in case the case occurs (eg. people)
            T.map((res) =>
              [...res].length > 1 ? [...res].reduce((a, b) => (Array.isArray(a) ? [...a, ...b] : [a, b])) : res,
            ),
          ),
        )

        return res
      }

      return yield* $(
        getFieldData({
          ...args,
          property: {
            ...propertyData,
            id: 'unkown',
          },
        }),
      )
    }),
}
