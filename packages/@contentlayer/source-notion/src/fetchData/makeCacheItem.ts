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
  previousCache: core.DataCache.Cache | undefined
  options: core.PluginOptions
}

export const makeCacheItem = ({ databaseTypeDef, documentTypeDef, previousCache, page, options }: MakeCacheItemArgs) =>
  pipe(
    T.gen(function* ($) {
      const documentHash = new Date(page.last_edited_time).getTime().toString()

      if (
        previousCache &&
        previousCache.cacheItemsMap[page.id] &&
        previousCache.cacheItemsMap[page.id]!.documentHash === documentHash &&
        previousCache.cacheItemsMap[page.id]!.hasWarnings === false
      ) {
        const cacheItem = previousCache.cacheItemsMap[page.id]!
        return cacheItem
      }

      const document = yield* $(makeDocument({ documentTypeDef, databaseTypeDef, page, options }))
      const computedValues = yield* $(getComputedValues({ document, documentTypeDef }))

      Object.entries(computedValues).forEach(([fieldName, value]) => {
        document[fieldName] = value
      })

      return {
        document,
        documentHash,
        hasWarnings: false,
        documentTypeName: documentTypeDef.name,
      }
    }),
    OT.withSpan('@contentlayer/source-notion/fetchData:makeCacheItem'),
  )
