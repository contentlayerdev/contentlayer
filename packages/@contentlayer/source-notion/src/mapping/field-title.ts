import type { FieldFunctions } from '.'

export const fieldTitle: FieldFunctions<'title'> = {
  getFieldDef: () => {
    return {
      type: 'string',
    }
  },
  getFieldData: ({ property, renderer }) => {
    return renderer.render(...property.title)
  },
}
