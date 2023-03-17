import type { FieldFunctions } from '.'

export const fieldCheckbox: FieldFunctions<'checkbox'> = {
  getFieldDef: () => {
    return {
      type: 'boolean',
    }
  },
  getFieldData: ({ property }) => {
    return property.checkbox
  },
}
