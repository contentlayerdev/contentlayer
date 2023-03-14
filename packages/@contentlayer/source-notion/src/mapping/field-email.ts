import type { FieldFunctions } from ".";

export const fieldEmail: FieldFunctions<'email'> = {
    getFieldDef: () => {
        return {
            type: 'string',
        }
    },
    getFieldData: ({ property }) => {
        return property.email;
    }
}