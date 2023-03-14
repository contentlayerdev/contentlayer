import type { FieldFunctions } from ".";

export const fieldCheckbox: FieldFunctions<'checkbox'> = {
    getFieldDef: () => {
        return {
            type: 'boolean',
            isRequired: false
        }
    },
    getFieldData: ({ property }) => {
        return property.checkbox;
    }
}