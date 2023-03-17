import * as os from 'node:os'

import * as core from '@contentlayer/core'
import type { HasConsole } from "@contentlayer/utils/effect";
import { Chunk, OT, pipe, T } from "@contentlayer/utils/effect";
import type { NotionRenderer } from '@notion-render/client';
import * as notion from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints.js';

import { UnknownNotionError } from '../errors.js';
import type * as LocalSchema from '../schema/types.js'
import { makeCacheItem } from './page.js';

type Page = PageObjectResponse

export const fetchAllDocuments = ({
    client,
    renderer,
    schemaDef,
    databaseTypeDefs,
    options,
}: {
    client: notion.Client,
    renderer: NotionRenderer,
    databaseTypeDefs: LocalSchema.DatabaseTypeDef[],
    schemaDef: core.SchemaDef,
    options: core.PluginOptions
}): T.Effect<OT.HasTracer & HasConsole, core.SourceFetchDataError, core.DataCache.Cache> => pipe(
    T.gen(function* ($) {
        const entries: {
            documentTypeDef: core.DocumentTypeDef,
            page: Page,
            databaseTypeDef: LocalSchema.DatabaseTypeDef
        }[] = [];

        for (const databaseDef of databaseTypeDefs) {
            const result = yield* $(fetchDatabasePages({ client, databaseDef }));;
            entries.push(...result.map(page => ({
                page,
                documentTypeDef: schemaDef.documentTypeDefMap[databaseDef.name]!,
                databaseTypeDef: databaseDef
            })));
        }

        const concurrencyLimit = os.cpus().length

        const documents = yield* $(
            pipe(
                entries,
                T.forEachParN(concurrencyLimit, ({ page, documentTypeDef, databaseTypeDef }) =>
                    makeCacheItem({
                        client,
                        page,
                        renderer,
                        documentTypeDef,
                        options,
                        databaseTypeDef
                    })
                ),
                OT.withSpan('@contentlayer/source-notion/fetchData:makeCacheItems', {
                    attributes: { count: entries.length },
                }),
            )
        )

        const cacheItemsMap = Object.fromEntries(Chunk.map_(documents, (_) => [_.document._id, _]))

        return { cacheItemsMap }
    }),
    OT.withSpan('@contentlayer/source-notion/fetchData:fetchAllDocuments', {
        attributes: { schemadef: JSON.stringify(schemaDef) },
    }),
    T.mapError((error) => new core.SourceFetchDataError({ error, alreadyHandled: false }))
)

const fetchDatabasePages = ({
    client,
    databaseDef
}: {
    client: notion.Client,
    databaseDef: LocalSchema.DatabaseTypeDef
}): T.Effect<OT.HasTracer, UnknownNotionError, Page[]> => pipe(
    // TODO : Use iteratePaginatedResult to process N pages by N pages to avoid storing in-memory all pages.
    T.tryPromise(() => notion.collectPaginatedAPI(client.databases.query, {
        database_id: databaseDef.databaseId,
        filter: databaseDef.query?.filter,
        sorts: databaseDef.query?.sorts,
    }).then(res => res as Page[])),
    OT.withSpan('@contentlayer/source-contentlayer/fetchData:getAllEntries'),
    T.mapError((error) => new UnknownNotionError({ error })),
)
