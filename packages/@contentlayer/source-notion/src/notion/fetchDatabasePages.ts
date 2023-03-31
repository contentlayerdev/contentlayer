import { Chunk, OT, pipe, S, T } from '@contentlayer/utils/effect'
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
    S.service(NotionClient),
    S.chain((client) =>
      S.async<unknown, unknown, PageObjectResponse[]>(async (emit) => {
        let nextCursor = undefined

        do {
          const res = await client.databases.query({
            database_id: databaseTypeDef.databaseId,
            filter: databaseTypeDef.query?.filter,
            sorts: databaseTypeDef.query?.sorts,
          })

          nextCursor = res.next_cursor
          emit.single(res.results as PageObjectResponse[])
        } while (nextCursor)

        emit.end()
      }),
    ),
    OT.withStreamSpan('@contentlayer/source-notion/fetchData:fetchDatabasePages'),
    S.mapError((error) => new UnknownNotionError({ error })),
  )
