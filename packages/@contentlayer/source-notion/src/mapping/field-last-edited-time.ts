import { T } from '@contentlayer/utils/effect'

import type { FieldFunctions } from '.'

export const fieldLastEditedTime: FieldFunctions<'last_edited_time'> = {
  getFieldDef: () =>
    T.succeed({
      type: 'date',
    }),
  getFieldData: ({ property }) => T.succeed(new Date(property.last_edited_time)),
}
