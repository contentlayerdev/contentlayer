import { SourceProvideSchemaError } from '@contentlayer/core'
import * as core from '@contentlayer/core'
import * as utils from '@contentlayer/utils'
import { OT, pipe, T } from '@contentlayer/utils/effect';
import type * as notion from '@notionhq/client'

import { fetchDatabaseFieldDefs } from './defs/database.js';
import type * as LocalSchema from './defs/index.js'

export const provideSchema = ({
    client,
    databaseTypeDefs,
    options
}: {
    client: notion.Client,
    databaseTypeDefs: LocalSchema.DatabaseTypeDef[],
    options: core.PluginOptions
}): T.Effect<OT.HasTracer, SourceProvideSchemaError, core.SchemaDef> => pipe(
    T.gen(function* ($) {
        const coreCodumentTypeDefMap: core.DocumentTypeDefMap = {};

        for (const databaseDef of databaseTypeDefs) {
            const fieldDefs = yield $(fetchDatabaseFieldDefs({ client, databaseDef, options }))

            coreCodumentTypeDefMap[databaseDef.name] = fieldDefs;
        }

        const defs: Omit<core.SchemaDef, 'hash'> = {
            documentTypeDefMap: coreCodumentTypeDefMap,
            nestedTypeDefMap: {
                date: {
                    _tag: 'NestedTypeDef',
                    name: 'Date',
                    description: undefined,
                    fieldDefs: [
                        {
                            name: 'start',
                            type: 'date',
                            description: undefined,
                            isSystemField: false,
                            isRequired: true,
                            default: undefined
                        },
                        {
                            name: 'end',
                            type: 'date',
                            description: undefined,
                            isSystemField: false,
                            isRequired: false,
                            default: undefined
                        },
                        {
                            name: 'timezone',
                            type: 'string',
                            description: undefined,
                            isSystemField: false,
                            isRequired: false,
                            default: undefined
                        }
                    ],
                    extensions: {}
                }
            },
        }

        const hash = yield* $(utils.hashObject({ defs, options }))

        const coreSchemaDef: core.SchemaDef = {
            ...defs,
            hash
        };

        core.validateSchema(coreSchemaDef);

        return coreSchemaDef;
    }),
    OT.withSpan('@contentlayer/source-notion/provideSchema:provideSchema'),
    T.mapError((error) => new SourceProvideSchemaError({ error }))
);