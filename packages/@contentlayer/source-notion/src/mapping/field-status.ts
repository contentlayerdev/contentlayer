import { T } from '@contentlayer/utils/effect'

import type { FieldFunctions } from '.'

export const fieldStatus: FieldFunctions<'status'> = {
  getFieldDef: ({ propertyData }) =>
    T.succeed({
      type: 'enum',
      options: propertyData.options.map((o) => o.name),
    }),
  getFieldData: ({ propertyData }) => T.succeed(propertyData?.name),
}
