import { pipe, T } from '@contentlayer/utils/effect'
import * as notion from '@notionhq/client'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

import type { DatabaseTypeDef } from '../schema/types/database.js'
import { NotionClient } from '../services.js'
import { UnknownNotionError } from './errors.js'

export type FetchDatabasePagesArgs = {
  databaseTypeDef: DatabaseTypeDef
}

export const fetchDatabasePages = ({ databaseTypeDef }: FetchDatabasePagesArgs) =>
  pipe(
    T.service(NotionClient),
    T.chain((client) =>
      T.tryPromise(
        () =>
          // TODO : Use iteratePaginatedResult to process N pages by N pages to avoid storing in-memory all pages.
          notion.collectPaginatedAPI(client.databases.query, {
            database_id: databaseTypeDef.databaseId,
            filter: databaseTypeDef.query?.filter,
            sorts: databaseTypeDef.query?.sorts,
          }) as Promise<PageObjectResponse[]>,
      ),
    ),
    T.mapError((error) => new UnknownNotionError({ error })),
  )
