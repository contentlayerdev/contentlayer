import type * as core from '@contentlayer/core'
import { processArgs } from '@contentlayer/core'
import { pipe, S, T } from '@contentlayer/utils/effect'
import * as notion from '@notionhq/client';

import { fetchAllDocuments } from './fetchData/index.js'
import type * as LocalSchema from './schema/defs/index.js'
import { provideSchema } from './schema/provideSchema.js'
import type { PluginOptions } from "./types.js"

export * from './schema/defs/index.js'

export type Args = {
    internalIntegrationToken: string,
    databaseTypes: LocalSchema.DatabaseTypes
}

export const makeSource: core.MakeSourcePlugin<Args & PluginOptions> = async (args) => {
    const {
        options,
        extensions,
        restArgs: {
            internalIntegrationToken,
            databaseTypes
        }
    } = await processArgs(args);

    const client = new notion.Client({ auth: internalIntegrationToken });

    const databaseTypeDefs = (Array.isArray(databaseTypes) ? databaseTypes : Object.values(databaseTypes)).map(
        (_) => _.def()
    )

    return {
        type: 'notion',
        extensions,
        options,
        provideSchema: () => provideSchema({ client, options, databaseTypeDefs }),
        fetchData: ({ schemaDef }) => pipe(
            S.fromEffect(
                pipe(
                    fetchAllDocuments({ client, databaseTypeDefs, schemaDef, options }),
                    T.either
                )
            ),
            // S.repeatSchedule(SC.spaced(5_000))
        )
    }
}