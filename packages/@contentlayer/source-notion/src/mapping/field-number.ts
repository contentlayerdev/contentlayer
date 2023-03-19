import { T } from '@contentlayer/utils/effect'

import type { FieldFunctions } from '.'

export const fieldNumber: FieldFunctions<'number'> = {
  getFieldDef: () =>
    T.succeed({
      type: 'number',
    }),
  getFieldData: ({ property }) => T.succeed(property.number),
}
