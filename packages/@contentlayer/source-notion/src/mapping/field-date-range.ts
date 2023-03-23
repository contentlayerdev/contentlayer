import { T } from '@contentlayer/utils/effect'

import type { FieldFunctions } from '.'

export const fieldDateRange: FieldFunctions<'date'> = {
  getFieldDef: () =>
    T.succeed({
      type: 'nested',
      nestedTypeName: 'DateRange',
    }),
  getFieldData: ({ propertyData }) => {
    if (!propertyData) return T.succeed(undefined)
    return T.succeed({
      start: new Date(propertyData.start),
      end: propertyData.end ? new Date(propertyData.end) : undefined,
      timezone: propertyData.time_zone ?? undefined,
    })
  },
}
