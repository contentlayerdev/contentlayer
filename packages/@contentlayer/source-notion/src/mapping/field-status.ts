import type { FieldFunctions } from ".";

export const fieldStatus: FieldFunctions<'status'> = {
    getFieldDef: ({ property }) => {
        return {
            type: 'enum',
            options: property.status.options.map(o => o.name),
            isRequired: false
        }
    },
    getFieldData: ({ property }) => {
        return property.status?.name;
    }
}