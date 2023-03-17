import type { FieldFunctions } from ".";

export const fieldRollup: FieldFunctions<'rollup'> = {
    getFieldDef: ({ property, documentTypeDefMap, databaseFieldTypeDef }) => {
        // if (
        //     databaseFieldTypeDef &&
        //     'type' in databaseFieldTypeDef &&
        //     databaseFieldTypeDef.type === 'rollup'
        // ) {
        //     const relation = databaseFieldTypeDef.relation.def().name;
        //     const documentTypeDef = documentTypeDefMap[relation];

        //     if (!documentTypeDef) {
        //         // TODO : Find a way to avoid this problem
        //         throw new Error(`Rollup property is not configured propertly, make sure ${relation} is loaded before.`);
        //     }

        //     // TODO : Fix typings
        //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //     // @ts-ignore
        //     const fieldDef = documentTypeDef.fieldDefs.find(field => field.propertyKey === property.rollup.rollup_property_name);
        //     if (!fieldDef) {
        //         throw new Error(`Rollup property is not configured propertly, make sure ${relation} is loaded before.`);
        //     }

        //     return fieldDef;
        // }

        throw new Error(`Rollup property is not configured propertly`);
    },
    getFieldData: ({ property }) => {
        return 'test'; // TODO getFieldData
    }
}