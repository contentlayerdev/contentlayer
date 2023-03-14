import type * as core from '@contentlayer/core'
import { HashError, hashObject } from '@contentlayer/utils';
import type { HasConsole, OT } from "@contentlayer/utils/effect";
import { pipe, T } from "@contentlayer/utils/effect";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

import { getFieldFunctions } from '../mapping/index.js';
import type { FieldDef, PageProperties } from '../types';

type MakeDocumentError = core.UnexpectedMarkdownError | core.UnexpectedMDXError | HashError

export const makeCacheItem = ({
    page,
    documentTypeDef,
    options
}: {
    page: PageObjectResponse,
    documentTypeDef: core.DocumentTypeDef,
    options: core.PluginOptions
}): T.Effect<OT.HasTracer & HasConsole, MakeDocumentError, core.DataCache.CacheItem> =>
    T.gen(function* ($) {
        const { typeFieldName } = options.fieldOptions

        const docValues = yield* $(
            T.forEachParDict_(documentTypeDef.fieldDefs as FieldDef[], {
                mapValue: (fieldDef: FieldDef) => getDataForFieldDef({
                    fieldDef: fieldDef,
                    property: page.properties[fieldDef.propertyKey] as PageProperties,
                    options
                }),
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
    options
}: {
    fieldDef: FieldDef
    property: PageProperties,
    options: core.PluginOptions
}): T.Effect<OT.HasTracer, MakeDocumentError, any> =>
    pipe(
        T.gen(function* ($) {
            const functions = getFieldFunctions(property.type);
            if (!functions) return;

            return functions.getFieldData({ property, fieldDef, options })
        }),
        T.mapError((error) => new HashError({ error }))
    )