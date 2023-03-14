import type * as core from '@contentlayer/core'
import { processArgs } from '@contentlayer/core'
import { pipe, S, T } from '@contentlayer/utils/effect'
import { NotionRenderer } from '@kerwanp/notion-renderer';
import type * as notion from '@notionhq/client';

import { fetchAllDocuments } from './fetchData/index.js'
import type * as LocalSchema from './schema/defs/index.js'
import { provideSchema } from './schema/provideSchema.js'
import type { PluginOptions } from "./types.js"

export * from './schema/defs/index.js'

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
    )

    const renderer = rest.renderer ?? new NotionRenderer();

    return {
        type: 'notion',
        extensions,
        options,
        provideSchema: () => provideSchema({ client, options, databaseTypeDefs }),
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