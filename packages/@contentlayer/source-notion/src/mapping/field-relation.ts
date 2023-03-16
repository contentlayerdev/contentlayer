import type { FieldFunctions } from ".";

export const fieldRelation: FieldFunctions<'relation'> = {
    getFieldDef: ({ databaseFieldDef }) => {

        if (databaseFieldDef?.single) {
            return {
                type: 'string',
            }
        }

        return {
            type: 'list',
            of: { type: 'string' }
        }
    },
    getFieldData: ({ property, databaseFieldDef }) => {

        if (databaseFieldDef?.single) {
            return property.relation[0]?.id
        }

        return property.relation.map(r => r.id);
    }
}