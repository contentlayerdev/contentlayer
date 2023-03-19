import { T } from '@contentlayer/utils/effect'

import type { DatabaseFieldTypeDef } from '../schema/types'
import type { FieldFunctions } from '.'

const isSingle = (databaseFieldTypeDef: DatabaseFieldTypeDef | undefined) => {
  return (
    databaseFieldTypeDef &&
    'type' in databaseFieldTypeDef &&
    databaseFieldTypeDef.type === 'relation' &&
    databaseFieldTypeDef.single
  )
}

export const fieldRelation: FieldFunctions<'relation'> = {
  getFieldDef: ({ databaseFieldTypeDef }) => {
    if (isSingle(databaseFieldTypeDef)) {
      return T.succeed({
        type: 'string',
      })
    }

    return T.succeed({
      type: 'list',
      of: { type: 'string' },
    })
  },
  getFieldData: ({ property, databaseFieldTypeDef }) => {
    if (isSingle(databaseFieldTypeDef)) {
      return T.succeed(property.relation[0]?.id)
    }

    return T.succeed(property.relation.map((r) => r.id))
  },
}
