import type { FieldFunctions } from ".";

export const fieldNumber: FieldFunctions<'number'> = {
    getFieldDef: () => {
        return {
            type: 'number',
        }
    },
    getFieldData: ({ property }) => {
        return property.number;
    }
}