import type * as core from '@contentlayer/core'
import { hashObject } from '@contentlayer/utils'
import { OT, pipe, T } from '@contentlayer/utils/effect'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

import type { DatabaseTypeDef } from '../schema/types/database.js'
import { getComputedValues } from './getComputedValues.js'
import { makeDocument } from './makeDocument.js'

export type MakeCacheItemArgs = {
  databaseTypeDef: DatabaseTypeDef
  documentTypeDef: core.DocumentTypeDef
  page: PageObjectResponse
  options: core.PluginOptions
}

export const makeCacheItem = ({ databaseTypeDef, documentTypeDef, page, options }: MakeCacheItemArgs) =>
  pipe(
    T.gen(function* ($) {
      const document = yield* $(makeDocument({ documentTypeDef, databaseTypeDef, page, options }))

      const computedValues = yield* $(getComputedValues({ document, documentTypeDef }))

      Object.entries(computedValues).forEach(([fieldName, value]) => {
        document[fieldName] = value
      })

      return document
    }),
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
    OT.withSpan('@contentlayer/source-notion/fetchData:makeCacheItem'),
  )
