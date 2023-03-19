import { T } from '@contentlayer/utils/effect'

import type { FieldFunctions } from '.'

export const fieldUrl: FieldFunctions<'url'> = {
  getFieldDef: () =>
    T.succeed({
      type: 'string',
    }),
  getFieldData: ({ property }) => T.succeed(property.url),
}
