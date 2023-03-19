import { T } from '@contentlayer/utils/effect'

import type { FieldFunctions } from '.'

export const fieldPhoneNumber: FieldFunctions<'phone_number'> = {
  getFieldDef: () =>
    T.succeed({
      type: 'string',
    }),
  getFieldData: ({ property }) => T.succeed(property.phone_number),
}
