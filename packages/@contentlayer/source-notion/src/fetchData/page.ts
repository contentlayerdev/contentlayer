import type * as core from '@contentlayer/core'
import { HashError, hashObject } from '@contentlayer/utils'
import type { HasConsole, OT } from '@contentlayer/utils/effect'
import { pipe, T } from '@contentlayer/utils/effect'
import type { NotionRenderer } from '@notion-render/client'
import type * as notion from '@notionhq/client'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

import { UnknownNotionError } from '../errors.js'
import type { GetFieldDataFunction } from '../mapping/index.js'
import { getFieldFunctions } from '../mapping/index.js'
import type { DatabaseTypeDef } from '../schema/types.js'
import type { FieldDef, PageProperties } from '../types'

type MakeDocumentError = core.UnexpectedMarkdownError | core.UnexpectedMDXError | HashError | UnknownNotionError

export type MakeCacheItemArgs = {
  client: notion.Client
  page: PageObjectResponse
  renderer: NotionRenderer
  databaseTypeDef: DatabaseTypeDef
  documentTypeDef: core.DocumentTypeDef
  options: core.PluginOptions
}

export const makeCacheItem = ({
  client,
  page,
  renderer,
  databaseTypeDef,
  documentTypeDef,
  options,
  ...rest
}: MakeCacheItemArgs): T.Effect<OT.HasTracer & HasConsole, MakeDocumentError, core.DataCache.CacheItem> =>
  T.gen(function* ($) {
    const { typeFieldName } = options.fieldOptions

    const docValues = yield* $(
      T.forEachParDict_(documentTypeDef.fieldDefs as FieldDef[], {
        mapValue: (fieldDef: FieldDef) => {
          if (fieldDef.name === 'content') return getPageContent({ page, client, renderer })

          const databaseFieldTypeDef = databaseTypeDef.fields?.find((field) => field.key === fieldDef.propertyKey)

          return getDataForFieldDef({
            fieldDef,
            property: page.properties[fieldDef.propertyKey] as PageProperties,
            renderer,
            databaseFieldTypeDef,
            options,
            client,
            page,
            databaseTypeDef,
            documentTypeDef,
            ...rest,
          })
        },
        mapKey: (fieldDef) => T.succeed(fieldDef.name),
      }),
    )

    const document: core.Document = {
      ...docValues,
      [typeFieldName]: documentTypeDef.name,
      _id: page.id,
      _raw: {},
    }

    const documentHash = yield* $(hashObject(document))

    return { document, documentHash, hasWarnings: false, documentTypeName: documentTypeDef.name }
  })

export type GetDataForFieldDefArgs = MakeCacheItemArgs & Parameters<GetFieldDataFunction<any>>[0]

const getDataForFieldDef = ({
  property,
  ...rest
}: GetDataForFieldDefArgs): T.Effect<OT.HasTracer, MakeDocumentError, any> =>
  pipe(
    T.gen(function* () {
      if (!property) return

      const functions = getFieldFunctions(property.type)
      if (!functions) return

      return functions.getFieldData({ property, ...rest })
    }),
    T.mapError((error) => new HashError({ error })),
  )

const getPageContent = ({
  page,
  renderer,
}: {
  page: PageObjectResponse
  client: notion.Client
  renderer: NotionRenderer
}): T.Effect<OT.HasTracer, UnknownNotionError, string> =>
  pipe(
    T.tryPromise(() => renderer.renderBlock(page.id)),
    T.mapError((error) => new UnknownNotionError({ error })),
  )
