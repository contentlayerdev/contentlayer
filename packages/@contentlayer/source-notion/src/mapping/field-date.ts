import { T } from '@contentlayer/utils/effect'

import type { FieldFunctions } from '.'

export const fieldDate: FieldFunctions<'date'> = {
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
  getFieldData: ({ property }) => {
    if (!property.date) return T.succeed(undefined)
    return T.succeed({
      start: new Date(property.date.start),
      end: property.date.end ? new Date(property.date.end) : undefined,
      timezone: property.date.time_zone ?? undefined,
    })
  },
}
