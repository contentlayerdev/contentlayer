import { T } from '@contentlayer/utils/effect'

import type { FieldFunctions } from '.'

export const fieldSelect: FieldFunctions<'select'> = {
  getFieldDef: ({ property }) =>
    T.succeed({
      type: 'enum',
      options: property.select.options.map((o) => o.name),
    }),
  getFieldData: ({ property }) => T.succeed(property.select?.name),
}
