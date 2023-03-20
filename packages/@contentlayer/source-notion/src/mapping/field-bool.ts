import { T } from '@contentlayer/utils/effect'

import type { FieldFunctions } from '.'

export const fieldBool: FieldFunctions<'checkbox'> = {
  getFieldDef: () =>
    T.succeed({
      type: 'boolean',
    }),
  getFieldData: ({ propertyData }) => T.succeed(propertyData),
}
