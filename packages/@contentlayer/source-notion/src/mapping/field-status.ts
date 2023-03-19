import { T } from '@contentlayer/utils/effect'

import type { FieldFunctions } from '.'

export const fieldStatus: FieldFunctions<'status'> = {
  getFieldDef: ({ property }) =>
    T.succeed({
      type: 'enum',
      options: property.status.options.map((o) => o.name),
    }),
  getFieldData: ({ property }) => T.succeed(property.status?.name),
}
