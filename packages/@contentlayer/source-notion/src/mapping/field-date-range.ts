import { T } from '@contentlayer/utils/effect'

import type { FieldFunctions } from '.'

export const fieldDateRange: FieldFunctions<'date'> = {
  getFieldDef: () =>
    T.succeed({
      type: 'nested_unnamed',
      typeDef: {
        _tag: 'NestedUnnamedTypeDef',
        fieldDefs: [
          {
            name: 'start',
            type: 'date',
            description: undefined,
            isSystemField: false,
            default: undefined,
            isRequired: true,
          },
          {
            name: 'end',
            type: 'date',
            description: undefined,
            isSystemField: false,
            default: undefined,
            isRequired: false,
          },
          {
            name: 'timezone',
            type: 'string',
            description: undefined,
            isSystemField: false,
            default: undefined,
            isRequired: false,
          },
        ],
        extensions: {},
      },
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
