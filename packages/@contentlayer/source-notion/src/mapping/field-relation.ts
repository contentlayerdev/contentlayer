import type { DatabaseFieldTypeDef } from "../schema/types";
import type { FieldFunctions } from ".";

const isSingle = (databaseFieldTypeDef: DatabaseFieldTypeDef | undefined) => {
    return databaseFieldTypeDef &&
        'type' in databaseFieldTypeDef &&
        databaseFieldTypeDef.type === 'relation' &&
        databaseFieldTypeDef.single
}

export const fieldRelation: FieldFunctions<'relation'> = {
    getFieldDef: ({ databaseFieldTypeDef }) => {
        if (isSingle(databaseFieldTypeDef)) {
            return {
                type: 'string',
            }
        }

        return {
            type: 'list',
            of: { type: 'string' }
        }
    },
    getFieldData: ({ property, databaseFieldTypeDef }) => {
        if (isSingle(databaseFieldTypeDef)) {
            return property.relation[0]?.id
        }

        return property.relation.map(r => r.id);
    }
}