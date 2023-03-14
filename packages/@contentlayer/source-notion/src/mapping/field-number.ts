import type { FieldFunctions } from ".";

export const fieldNumber: FieldFunctions<'number'> = {
    getFieldDef: () => {
        return {
            type: 'number',
            isRequired: false
        }
    },
    getFieldData: ({ property }) => {
        return property.number;
    }
}