import { OT, pipe, S } from '@contentlayer/utils/effect'
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
        let nextCursor: string | undefined = undefined
        console.log(`Querying pages for ${databaseTypeDef.name}`)

        do {
          console.log(`Querying pages for ${databaseTypeDef.name} with cursor ${nextCursor}`)
          const res = await client.databases.query({
            database_id: databaseTypeDef.databaseId,
            start_cursor: nextCursor ?? undefined,
            filter: databaseTypeDef.query?.filter,
            sorts: databaseTypeDef.query?.sorts,
          })

          console.log(`Found ${res.results.length} pages`)
          nextCursor = res.next_cursor as string | undefined // NOTE: Throw type error and make res any if not typed, why???
          emit.single(res.results as PageObjectResponse[])
        } while (nextCursor)

        emit.end()
      }),
    ),
    OT.withStreamSpan('@contentlayer/source-notion/fetchData:fetchDatabasePages'),
    S.mapError((error) => new UnknownNotionError({ error })),
  )
