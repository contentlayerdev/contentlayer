import * as os from 'node:os'

import * as core from '@contentlayer/core'
import { Chunk, OT, pipe, T } from '@contentlayer/utils/effect'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

import { fetchDatabasePages } from '../notion/fetchDatabasePages.js'
import type { DatabaseTypeDef } from '../schema/types/database.js'
import { makeCacheItem } from './makeCacheItem.js'

export type FetchAllDocumentsArgs = {
  databaseTypeDefs: DatabaseTypeDef[]
  schemaDef: core.SchemaDef
  options: core.PluginOptions
}

export const fetchAllDocuments = ({ databaseTypeDefs, schemaDef, options }: FetchAllDocumentsArgs) =>
  pipe(
    T.forEachPar_(databaseTypeDefs, (databaseTypeDef) =>
      pipe(
        fetchDatabasePages({ databaseTypeDef }),
        T.chain((pages) =>
          T.forEachPar_(pages, (page) =>
            T.succeed({
              page,
              documentTypeDef: schemaDef.documentTypeDefMap[databaseTypeDef.name]!,
              databaseTypeDef,
            }),
          ),
        ),
      ),
    ),
    T.chain((chunks) =>
      T.reduce_(
        chunks,
        [] as {
          documentTypeDef: core.DocumentTypeDef
          page: PageObjectResponse
          databaseTypeDef: DatabaseTypeDef
        }[],
        (z, a) => T.succeed([...z, ...a]),
      ),
    ),
    T.chain((entries) =>
      T.forEachParN_(entries, os.cpus().length, ({ page, documentTypeDef, databaseTypeDef }) =>
        makeCacheItem({ page, documentTypeDef, databaseTypeDef, options }),
      ),
    ),
    T.map((documents) => ({
      cacheItemsMap: Object.fromEntries(Chunk.map_(documents, (_) => [_.document._id, _])),
    })),
    OT.withSpan('@contentlayer/source-notion/schema:provideSchema'),
    T.mapError((error) => new core.SourceFetchDataError({ error, alreadyHandled: false })),
  )
