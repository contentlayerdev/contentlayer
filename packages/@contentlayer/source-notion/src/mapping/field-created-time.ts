import { T } from '@contentlayer/utils/effect'

import type { FieldFunctions } from '.'

export const fieldCreatedTime: FieldFunctions<'created_time'> = {
  getFieldDef: () =>
    T.succeed({
      type: 'date',
    }),
  getFieldData: ({ property }) => T.succeed(new Date(property.created_time)),
}
