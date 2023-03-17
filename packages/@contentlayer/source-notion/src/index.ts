import type * as core from '@contentlayer/core'
import { processArgs } from '@contentlayer/core'
import { pipe, S, T } from '@contentlayer/utils/effect'
import { NotionRenderer } from '@notion-render/client';
import type * as notion from '@notionhq/client';

import { fetchAllDocuments } from './fetchData/index.js'
import { provideSchema } from './schema/provideSchema.js'
import type * as LocalSchema from './schema/types.js'
import type { PluginOptions } from "./types.js"

export * from './schema/types.js'

export type Args = {
    client: notion.Client,
    renderer?: NotionRenderer,
    databaseTypes: LocalSchema.DatabaseTypes
}

export const makeSource: core.MakeSourcePlugin<Args & PluginOptions> = async (args) => {
    const {
        options,
        extensions,
        restArgs: {
            client,
            databaseTypes,
            ...rest
        }
    } = await processArgs(args);

    const databaseTypeDefs = (Array.isArray(databaseTypes) ? databaseTypes : Object.values(databaseTypes)).map(
        (_) => _.def()
    ).map((databaseTypeDef) => ({
        ...databaseTypeDef,
        fields: databaseTypeDef.fields ? Array.isArray(databaseTypeDef.fields) ?
            databaseTypeDef.fields :
            Object.entries(databaseTypeDef.fields).map(([key, field]) => ({
                key,
                ...field
            })) : []
    }))

    const renderer = rest.renderer ?? new NotionRenderer({ client });

    return {
        type: 'notion',
        extensions,
        options,
        provideSchema: () => provideSchema({ client, databaseTypeDefs, options }),
        fetchData: ({ schemaDef }) => pipe(
            S.fromEffect(
                pipe(
                    fetchAllDocuments({ client, renderer, databaseTypeDefs, schemaDef, options }),
                    T.either
                )
            ),
            // S.repeatSchedule(SC.spaced(5_000))
        )
    }
}