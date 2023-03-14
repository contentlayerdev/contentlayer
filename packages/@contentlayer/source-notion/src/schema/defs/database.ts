import * as core from '@contentlayer/core'
import { OT, pipe, T } from '@contentlayer/utils/effect';
import type * as notion from '@notionhq/client';

import type { DatabaseProperties } from '../../types';
import type { DatabaseFieldTypeDef, DatabaseTypeDef } from '.';
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

        for (const [propertyKey, property] of Object.entries(properties)) {
            const [key, databaseFieldDef] = findDatabaseFieldDef({ property, databaseDef, key: propertyKey })

            if (databaseDef.automaticImport === false && !databaseFieldDef) continue;

            const def = toFieldDef({ property, key, options, databaseFieldDef })
            if (!def) continue;

            fieldDefs.push(def);
        }

        if (databaseDef.importContent !== false) {
            fieldDefs.push({
                type: 'string',
                name: 'content',
                default: undefined,
                isRequired: false,
                isSystemField: true,
                description: 'The page content'
            })
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


const findDatabaseFieldDef = ({
    property,
    databaseDef,
    key,
}: {
    property: DatabaseProperties,
    databaseDef: DatabaseTypeDef,
    key: string
}): [string, DatabaseFieldTypeDef | undefined] => {

    if (!databaseDef.fields) return [key, undefined];

    const fieldDef = Object.entries(databaseDef.fields).find(([key, fieldDef]) => {
        if ('label' in fieldDef) return fieldDef.label === property.name
        if ('id' in fieldDef) return fieldDef.id === property.id
    });

    return fieldDef ?? [key, undefined]
}