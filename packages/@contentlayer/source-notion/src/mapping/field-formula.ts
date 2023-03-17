import type { FieldFunctions } from '.'

export const fieldFormula: FieldFunctions<'formula'> = {
  getFieldDef: () => {
    return {
      type: 'string',
    }
  },
  getFieldData: ({ property }) => {
    const type = property.formula.type
    if (type in property.formula) return (property.formula as any)[type]
    return
  },
}
