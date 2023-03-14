import type { FieldFunctions } from ".";

export const fieldCreatedTime: FieldFunctions<'created_time'> = {
    getFieldDef: () => {
        return {
            type: 'date',
            isRequired: false
        }
    },
    getFieldData: ({ property }) => {
        return new Date(property.created_time);
    }
}