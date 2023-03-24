import { T } from '@contentlayer/utils/effect'

import type { FieldFunctions } from '.'

export const fieldMultiSelect: FieldFunctions<'multi_select'> = {
  getFieldDef: ({ propertyData }) =>
    T.succeed({
      type: 'list',
      of: {
        type: 'enum',
        options: propertyData.options.map((o) => o.name),
      },
    }),
  getFieldData: ({ propertyData }) => T.succeed(propertyData.map((d) => d.name)),
}
