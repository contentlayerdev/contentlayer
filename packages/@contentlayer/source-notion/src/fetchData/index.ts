import * as os from 'node:os'

import * as core from '@contentlayer/core'
import type { HasConsole } from "@contentlayer/utils/effect";
import { Chunk, OT, pipe, T } from "@contentlayer/utils/effect";
import type { NotionRenderer } from '@kerwanp/notion-renderer';
import type * as notion from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints.js';

import { UnknownNotionError } from '../errors.js';
import type * as LocalSchema from '../schema/defs/index.js'
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
        const pages: Page[] = [];

        for (const databaseDef of databaseTypeDefs) {
            const result = yield* $(fetchDatabasePages({ client, databaseDef }));;
            pages.push(...result);
        }


        const documentEntriesWithDocumentTypeDef = Object.values(schemaDef.documentTypeDefMap).flatMap(
            (documentTypeDef) => pages.map((page) => ({ page, documentTypeDef }))
        );

        const concurrencyLimit = os.cpus().length

        const documents = yield* $(
            pipe(
                documentEntriesWithDocumentTypeDef,
                T.forEachParN(concurrencyLimit, ({ page, documentTypeDef }) =>
                    makeCacheItem({
                        client,
                        page,
                        renderer,
                        documentTypeDef,
                        options
                    })
                ),
                OT.withSpan('@contentlayer/source-notion/fetchData:makeCacheItems', {
                    attributes: { count: documentEntriesWithDocumentTypeDef.length },
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
    T.tryPromise(() => client.databases.query({ database_id: databaseDef.databaseId }).then(res => res.results as Page[])),
    OT.withSpan('@contentlayer/source-contentlayer/fetchData:getAllEntries'),
    T.mapError((error) => new UnknownNotionError({ error })),
)
