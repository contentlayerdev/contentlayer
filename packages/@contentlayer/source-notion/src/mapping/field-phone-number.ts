import type { FieldFunctions } from ".";

export const fieldPhoneNumber: FieldFunctions<'phone_number'> = {
    getFieldDef: () => {
        return {
            type: 'string',
            isRequired: false
        }
    },
    getFieldData: ({ property }) => {
        return property.phone_number;
    }
}