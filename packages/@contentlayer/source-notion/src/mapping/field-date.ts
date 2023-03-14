import type { FieldFunctions } from ".";

export const fieldDate: FieldFunctions<'date'> = {
    getFieldDef: () => {
        return {
            type: 'nested_unnamed',
            typeDef: {
                _tag: 'NestedUnnamedTypeDef',
                fieldDefs: [
                    {
                        name: 'start',
                        type: 'date',
                        description: undefined,
                        isSystemField: false,
                        default: undefined,
                        isRequired: true,
                    },
                    {
                        name: 'end',
                        type: 'date',
                        description: undefined,
                        isSystemField: false,
                        default: undefined,
                        isRequired: false,
                    },
                    {
                        name: 'timezone',
                        type: 'string',
                        description: undefined,
                        isSystemField: false,
                        default: undefined,
                        isRequired: false,
                    }
                ],
                extensions: {}
            },
        }
    },
    getFieldData: ({ property }) => {
        if (!property.date) return undefined;
        return {
            start: new Date(property.date.start),
            end: property.date.end ? new Date(property.date.end) : undefined,
            timezone: property.date.time_zone ?? undefined
        };
    }
}