import { T } from '@contentlayer/utils/effect'

import type { FieldFunctions } from '.'

export const fieldFormula: FieldFunctions<'formula'> = {
  getFieldDef: () =>
    T.succeed({
      type: 'string',
    }),
  getFieldData: ({ property }) => {
    const type = property.formula.type
    if (type in property.formula) return T.succeed((property.formula as any)[type])
    return T.succeed(undefined)
  },
}
