import type * as core from '@contentlayer/core'
import { hashObject } from '@contentlayer/utils'
import { pipe, T } from '@contentlayer/utils/effect'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

import { getFieldData } from '../mapping/index.js'
import { fetchPageContent } from '../notion/fetchPageContent.js'
import type { DatabaseFieldTypeDef, DatabaseTypeDef } from '../schema/types.js'
import type { FieldDef, PageProperties } from '../types.js'

export type ProvideDataForFieldDef = {
  property: PageProperties
  databaseTypeDef: DatabaseTypeDef
  databaseFieldTypeDef: DatabaseFieldTypeDef | undefined
  fieldDef: FieldDef
  documentTypeDef: core.DocumentTypeDef
}

export type MakeCacheItemArgs = {
  databaseTypeDef: DatabaseTypeDef
  documentTypeDef: core.DocumentTypeDef
  page: PageObjectResponse
  options: core.PluginOptions
}

export const makeCacheItem = ({ databaseTypeDef, documentTypeDef, page, options }: MakeCacheItemArgs) =>
  pipe(
    T.forEachParDict_(documentTypeDef.fieldDefs as FieldDef[], {
      mapKey: (fieldDef) => T.succeed(fieldDef.name),
      mapValue: (fieldDef) => {
        const databaseFieldTypeDef = databaseTypeDef.fields?.find((field) => field.key === fieldDef.propertyKey)

        return getFieldData({
          fieldDef,
          property: page.properties[fieldDef.propertyKey] as PageProperties,
          databaseFieldTypeDef,
          databaseTypeDef,
          documentTypeDef,
        })
      },
    }),
    T.chain((docValues) =>
      T.gen(function* ($) {
        return {
          ...docValues,
          [options.fieldOptions.typeFieldName]: documentTypeDef.name,
          _id: page.id,
          _raw: {},
          ...(databaseTypeDef.importContent
            ? {
                [options.fieldOptions.bodyFieldName]: yield* $(fetchPageContent({ page })),
              }
            : {}),
        }
      }),
    ),
    T.chain((document) =>
      pipe(
        hashObject(document),
        T.map((hash) => ({
          document,
          documentHash: hash,
          hasWarnings: false,
          documentTypeName: documentTypeDef.name,
        })),
      ),
    ),
  )
