import type * as core from '@contentlayer/core'
import type { OT } from "@contentlayer/utils/effect";
import { pipe, T } from "@contentlayer/utils/effect";

import { provideDatabaseFieldSchema } from './provideDatabaseFieldSchema';
import type { ProvideSchemaArgs } from "./provideSchema";
import type { DatabaseTypeDef } from "./types";

export type ProvideDatabaseSchemaArgs = {
    databaseTypeDef: DatabaseTypeDef
    documentTypeDefMap: core.DocumentTypeDefMap
} & ProvideSchemaArgs;

export const provideDatabaseSchema =
    ({ client, databaseTypeDef, ...args }: ProvideDatabaseSchemaArgs):
        T.Effect<OT.HasTracer, unknown, core.DocumentTypeDef> => pipe(
            T.tryPromise(() => client.databases.retrieve({ database_id: databaseTypeDef.databaseId })),
            T.chain(({ properties }) => pipe(
                Object.values(properties),
                T.forEachPar((property) => provideDatabaseFieldSchema({ client, databaseTypeDef, property, ...args })),
                T.map((def) => ({
                    _tag: 'DocumentTypeDef' as const,
                    name: databaseTypeDef.name,
                    description: databaseTypeDef.description,
                    isSingleton: false,
                    fieldDefs: [...def],
                    computedFields: [],
                    extensions: {}
                }))
            ))
        )
