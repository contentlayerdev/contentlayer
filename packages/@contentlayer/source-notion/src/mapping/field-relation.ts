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
  getFieldData: ({ propertyData, databaseFieldTypeDef }) => {
    if (isSingle(databaseFieldTypeDef)) {
      return T.succeed(propertyData[0]?.id)
    }

    return T.succeed(propertyData.map((r) => r.id))
  },
}
