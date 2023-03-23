import type * as core from '@contentlayer/core'
import { OT, pipe, T } from '@contentlayer/utils/effect'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

import { getFieldData } from '../mapping/index.js'
import { fetchPageContent } from '../notion/fetchPageContent.js'
import type { PageProperties } from '../notion/types.js'
import type { DatabaseTypeDef } from '../schema/types/database.js'
import type { FieldDef } from '../types.js'

export type MakeDocument = {
  databaseTypeDef: DatabaseTypeDef
  documentTypeDef: core.DocumentTypeDef
  page: PageObjectResponse
  options: core.PluginOptions
}

export const makeDocument = ({ documentTypeDef, databaseTypeDef, page, options }: MakeDocument) =>
  pipe(
    T.forEachParDict_(documentTypeDef.fieldDefs.filter((f) => !f.isSystemField) as FieldDef[], {
      mapKey: (fieldDef) => T.succeed(fieldDef.name),
      mapValue: (fieldDef) => {
        const databaseFieldTypeDef = databaseTypeDef.properties?.find((field) => field.key === fieldDef.propertyKey)

        return getFieldData({
          fieldDef,
          property: page.properties[fieldDef.propertyKey!] as PageProperties,
          databaseFieldTypeDef,
          databaseTypeDef,
          documentTypeDef,
        })
      },
    }),
    T.chain((docValues) =>
      T.gen(function* ($) {
        const document: core.Document = {
          ...docValues,
          [options.fieldOptions.typeFieldName]: documentTypeDef.name,
          _id: page.id,
          _raw: {},
          ...(databaseTypeDef.importContent !== false
            ? {
                [options.fieldOptions.bodyFieldName]: yield* $(fetchPageContent({ page })),
              }
            : {}),
        }

        return document
      }),
    ),
    OT.withSpan('@contentlayer/source-notion/fetchData:makeDocument'),
  )
