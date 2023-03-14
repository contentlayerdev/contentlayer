import type { FieldFunctions } from ".";

export const fieldTitle: FieldFunctions<'title'> = {
    getFieldDef: () => {
        return {
            type: 'string',
        }
    },
    getFieldData: ({ property }) => {
        return property.title[0]?.plain_text;
    }
}