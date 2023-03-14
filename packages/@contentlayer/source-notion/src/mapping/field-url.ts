import type { FieldFunctions } from ".";

export const fieldUrl: FieldFunctions<'url'> = {
    getFieldDef: () => {
        return {
            type: 'string',
            isRequired: false
        }
    },
    getFieldData: ({ property }) => {
        return property.url;
    }
}