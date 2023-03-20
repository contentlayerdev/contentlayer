import { T } from '@contentlayer/utils/effect'

import type { FieldFunctions } from '.'

export const fieldDate: FieldFunctions<'created_time' | 'last_edited_time'> = {
  getFieldDef: () =>
    T.succeed({
      type: 'date',
    }),
  getFieldData: ({ propertyData }) => T.succeed(new Date(propertyData)),
}
