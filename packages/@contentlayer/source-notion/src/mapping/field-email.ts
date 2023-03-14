import type { FieldFunctions } from ".";

export const fieldEmail: FieldFunctions<'email'> = {
    getFieldDef: () => {
        return {
            type: 'string',
            isRequired: false
        }
    },
    getFieldData: ({ property }) => {
        return property.email;
    }
}