import { T } from '@contentlayer/utils/effect'

import type { FieldFunctions } from '.'

export const fieldCheckbox: FieldFunctions<'checkbox'> = {
  getFieldDef: () =>
    T.succeed({
      type: 'boolean',
    }),
  getFieldData: ({ property }) => T.succeed(property.checkbox),
}
