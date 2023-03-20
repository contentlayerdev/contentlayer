import { T } from '@contentlayer/utils/effect'

import type { FieldFunctions } from '.'

export const fieldFormula: FieldFunctions<'formula'> = {
  getFieldDef: () =>
    T.succeed({
      type: 'string',
    }),
  getFieldData: ({ propertyData }) => {
    const type = propertyData.type
    if (type in propertyData) return T.succeed((propertyData as any)[type])
    return T.succeed(undefined)
  },
}
