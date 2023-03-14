import type { FieldFunctions } from ".";

export const fieldPhoneNumber: FieldFunctions<'phone_number'> = {
    getFieldDef: () => {
        return {
            type: 'string',
        }
    },
    getFieldData: ({ property }) => {
        return property.phone_number;
    }
}