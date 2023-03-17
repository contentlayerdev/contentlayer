import type { OT } from "@contentlayer/utils/effect";
import { pipe, T } from "@contentlayer/utils/effect";

import { getFieldFunctions } from "../mapping";
import type { DatabaseProperties, FieldDef } from "../types";
import type { ProvideDatabaseSchemaArgs } from "./provideDatabaseSchema";
import type { DatabaseTypeDef } from "./types";
import { findDatabaseFieldDef } from "./utils/findDatabaseFieldDef";
import { normalizeKey } from "./utils/normalizeKey";

export type ProvideDatabaseFieldSchemaArgs = {
    property: DatabaseProperties
    databaseTypeDef: DatabaseTypeDef,
} & Omit<ProvideDatabaseSchemaArgs, 'databaseTypeDef'>

export const provideDatabaseFieldSchema =
    ({ property, databaseTypeDef, ...rest }: ProvideDatabaseFieldSchemaArgs):
        T.Effect<OT.HasTracer, unknown, FieldDef> => pipe(
            T.succeed(findDatabaseFieldDef({ databaseTypeDef, property })),
            T.chain((databaseFieldTypeDef) => pipe(
                T.succeed(getFieldFunctions(property.type)?.getFieldDef({ property, databaseFieldTypeDef, databaseTypeDef, ...rest })),
                T.map((def) => {
                    const name = normalizeKey(databaseFieldTypeDef?.key ?? property.name);

                    return {
                        ...def,
                        name,
                        propertyKey: property.name,
                        isSystemField: false,
                        description: databaseFieldTypeDef?.description,
                        isRequired: databaseFieldTypeDef?.isRequired ?? false,
                    } as FieldDef
                })
            ))
        )

