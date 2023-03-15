import type * as core from '@contentlayer/core'
import { HashError, hashObject } from '@contentlayer/utils';
import type { HasConsole, OT } from "@contentlayer/utils/effect";
import { pipe, T } from "@contentlayer/utils/effect";
import type { NotionRenderer } from '@notion-render/client';
import type * as notion from '@notionhq/client'
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

import { UnknownNotionError } from '../errors.js';
import { getFieldFunctions } from '../mapping/index.js';
import type { FieldDef, PageProperties } from '../types';

type MakeDocumentError = core.UnexpectedMarkdownError | core.UnexpectedMDXError | HashError | UnknownNotionError

export const makeCacheItem = ({
    client,
    page,
    renderer,
    documentTypeDef,
    options
}: {
    client: notion.Client,
    page: PageObjectResponse,
    renderer: NotionRenderer,
    documentTypeDef: core.DocumentTypeDef,
    options: core.PluginOptions
}): T.Effect<OT.HasTracer & HasConsole, MakeDocumentError, core.DataCache.CacheItem> =>
    T.gen(function* ($) {
        const { typeFieldName } = options.fieldOptions


        const docValues = yield* $(
            T.forEachParDict_(documentTypeDef.fieldDefs as FieldDef[], {
                mapValue: (fieldDef: FieldDef) => {
                    if (fieldDef.name === 'content') return getPageContent({ page, client, renderer });

                    return getDataForFieldDef({
                        fieldDef: fieldDef,
                        property: page.properties[fieldDef.propertyKey] as PageProperties,
                        renderer,
                        options
                    });
                },
                mapKey: (fieldDef) => T.succeed(fieldDef.name)
            })
        );

        const document: core.Document = {
            ...docValues,
            [typeFieldName]: documentTypeDef.name,
            _id: page.id,
            _raw: {},
        }

        const documentHash = yield* $(hashObject(document));

        return { document, documentHash, hasWarnings: false, documentTypeName: documentTypeDef.name }
    })

const getDataForFieldDef = ({
    fieldDef,
    property,
    renderer,
    options
}: {
    fieldDef: FieldDef
    property: PageProperties,
    renderer: NotionRenderer,
    options: core.PluginOptions,
}): T.Effect<OT.HasTracer, MakeDocumentError, any> =>
    pipe(
        T.gen(function* () {
            const functions = getFieldFunctions(property.type);
            if (!functions) return;

            return functions.getFieldData({ property, fieldDef, renderer, options })
        }),
        T.mapError((error) => new HashError({ error }))
    )


const getPageContent = ({
    page,
    renderer,
}: {
    page: PageObjectResponse,
    client: notion.Client,
    renderer: NotionRenderer,
}): T.Effect<OT.HasTracer, UnknownNotionError, string> => pipe(
    T.tryPromise(() => renderer.renderBlock(page.id)),
    T.mapError((error) => new UnknownNotionError({ error }))
)