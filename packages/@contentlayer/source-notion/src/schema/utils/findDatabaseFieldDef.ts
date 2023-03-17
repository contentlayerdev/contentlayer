import type { DatabaseProperties } from "../../types";
import type { DatabaseTypeDef } from "../types";

export type FindDatabaseFieldDefArgs = {
    property: DatabaseProperties,
    databaseTypeDef: DatabaseTypeDef
}

export const findDatabaseFieldDef = ({ databaseTypeDef, property }: FindDatabaseFieldDefArgs) => {
    if (!databaseTypeDef.fields) return;

    return databaseTypeDef.fields.find((fieldDef) => {
        if ('label' in fieldDef) return fieldDef.label === property.name
        if ('id' in fieldDef) return fieldDef.id === property.id
    })
}