import type { FieldFunctions } from '.'

export const fieldRichText: FieldFunctions<'rich_text'> = {
  getFieldDef: () => {
    return {
      type: 'string',
    }
  },
  getFieldData: ({ property, renderer }) => {
    return renderer.render(...property.rich_text)
  },
}
