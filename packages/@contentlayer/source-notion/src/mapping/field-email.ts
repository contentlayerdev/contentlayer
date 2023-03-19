import { T } from '@contentlayer/utils/effect'

import type { FieldFunctions } from '.'

export const fieldEmail: FieldFunctions<'email'> = {
  getFieldDef: () =>
    T.succeed({
      type: 'string',
    }),
  getFieldData: ({ property }) => T.succeed(property.email),
}
