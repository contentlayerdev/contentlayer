import * as core from '@contentlayer/core'
import { OT, pipe, T } from '@contentlayer/utils/effect';
import type * as notion from '@notionhq/client';

import type { DatabaseTypeDef } from '.';
import { toFieldDef } from './field.js';

export const fetchDatabaseFieldDefs = ({
    client,
    databaseDef,
    options,
}: {
    client: notion.Client,
    databaseDef: DatabaseTypeDef,
    options: core.PluginOptions,
}): T.Effect<OT.HasTracer, core.SourceProvideSchemaError, core.DocumentTypeDef> => pipe(
    T.tryPromise(async () => {
        const { properties } = await client.databases.retrieve({ database_id: databaseDef.databaseId });

        const fieldDefs: core.FieldDef[] = []

        for (const [key, property] of Object.entries(properties)) {
            const fieldDef = toFieldDef({ property, key, options })
            if (!fieldDef) continue;

            fieldDefs.push(fieldDef);
        }

        return {
            _tag: 'DocumentTypeDef' as const,
            name: databaseDef.name,
            description: databaseDef.description,
            isSingleton: false,
            fieldDefs,
            computedFields: [],
            extensions: {}
        };
    }),
    OT.withSpan('@contentlayer/source-notion/fetchData:fetchDatabaseFieldDefs'),
    T.mapError((error) => new core.SourceProvideSchemaError({ error }))
)
