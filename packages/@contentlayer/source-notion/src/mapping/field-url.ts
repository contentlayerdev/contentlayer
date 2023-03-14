import type { FieldFunctions } from ".";

export const fieldUrl: FieldFunctions<'url'> = {
    getFieldDef: () => {
        return {
            type: 'string',
        }
    },
    getFieldData: ({ property }) => {
        return property.url;
    }
}