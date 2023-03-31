import * as core from '@contentlayer/core'
import { OT, pipe, T } from '@contentlayer/utils/effect'

import type { DatabaseTypeDef } from '../schema/types/database.js'
import { fetchAllDocuments } from './fetchAllDocuments.js'

export type FetchDataArgs = {
  databaseTypeDefs: DatabaseTypeDef[]
  schemaDef: core.SchemaDef
  options: core.PluginOptions
}

export const fetchData = ({ schemaDef, databaseTypeDefs, options }: FetchDataArgs) => {
  const resolveParams = pipe(core.DataCache.loadPreviousCacheFromDisk({ schemaHash: schemaDef.hash }), T.either)
  return pipe(
    T.rightOrFail(resolveParams),
    T.chain((cache) =>
      pipe(
        fetchAllDocuments({ schemaDef, databaseTypeDefs, previousCache: cache, options }),
        T.tap((cache_) => T.succeedWith(() => (cache = cache_))),
        T.tap((cache_) => core.DataCache.writeCacheToDisk({ cache: cache_, schemaHash: schemaDef.hash })),
      ),
    ),
    OT.withSpan('@contentlayer/source-notion/fetchData:fetchData'),
    T.mapError((error) => new core.SourceFetchDataError({ error, alreadyHandled: false })),
  )
}
