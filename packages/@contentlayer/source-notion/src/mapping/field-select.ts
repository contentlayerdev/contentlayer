import type { FieldFunctions } from ".";

export const fieldSelect: FieldFunctions<'select'> = {
    getFieldDef: ({ property }) => {
        return {
            type: 'enum',
            options: property.select.options.map(o => o.name),
            isRequired: false
        }
    },
    getFieldData: ({ property }) => {
        return property.select?.name;
    }
}