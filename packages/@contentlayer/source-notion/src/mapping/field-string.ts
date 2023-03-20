import { T } from '@contentlayer/utils/effect'

import type { FieldFunctions } from '.'

export const fieldString: FieldFunctions<'phone_number'> = {
  getFieldDef: () =>
    T.succeed({
      type: 'string',
    }),
  getFieldData: ({ propertyData }) => T.succeed(propertyData),
}
