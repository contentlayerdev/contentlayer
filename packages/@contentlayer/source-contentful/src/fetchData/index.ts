import * as os from 'node:os'

import * as core from '@contentlayer/core'
import { fs } from '@contentlayer/utils'
import type { HasConsole } from '@contentlayer/utils/effect'
import { Chunk, OT, pipe, T } from '@contentlayer/utils/effect'

import {
  environmentGetAssets,
  environmentGetContentTypes,
  environmentGetEntries,
  getEnvironment,
} from '../contentful.js'
import type { UnknownContentfulError } from '../errors.js'
import type * as SchemaOverrides from '../schemaOverrides.js'
import { normalizeSchemaOverrides } from '../schemaOverrides.js'
import type { Contentful } from '../types.js'
import { makeCacheItem } from './mapping.js'

export const fetchAllDocuments = ({
  accessToken,
  spaceId,
  environmentId,
  schemaDef,
  schemaOverrides: schemaOverrides_,
  options,
}: {
  accessToken: string
  spaceId: string
  environmentId: string
  schemaDef: core.SchemaDef
  schemaOverrides: SchemaOverrides.Input.SchemaOverrides
  options: core.PluginOptions
}): T.Effect<OT.HasTracer & HasConsole & fs.HasFs, core.SourceFetchDataError, core.DataCache.Cache> =>
  pipe(
    T.gen(function* ($) {
      const environment = yield* $(getEnvironment({ accessToken, spaceId, environmentId }))
      const contentTypes = yield* $(environmentGetContentTypes(environment))

      const schemaOverrides = normalizeSchemaOverrides({
        contentTypes,
        schemaOverrides: schemaOverrides_,
      })

      // Needs to be done sequencially, because of Contentful's API rate limiting
      const allEntries = yield* $(getAllEntries(environment))
      const allAssets = yield* $(getAllAssets(environment))

      if (process.env['CL_DEBUG']) {
        yield* $(OT.addAttribute('schemaOverrides', JSON.stringify(schemaOverrides)))
        yield* $(fs.writeFileJson({ filePath: '.tmp.assets.json', content: allAssets as any }))
        yield* $(fs.writeFileJson({ filePath: '.tmp.entries.json', content: allEntries as any }))
      }

      const isEntryADocument = ({
        entry,
        documentTypeDef,
      }: {
        entry: Contentful.Entry
        documentTypeDef: core.DocumentTypeDef
      }) => schemaOverrides.documentTypes[entry.sys.contentType.sys.id]?.defName === documentTypeDef.name

      const documentEntriesWithDocumentTypeDef = Object.values(schemaDef.documentTypeDefMap).flatMap(
        (documentTypeDef) =>
          allEntries
            .filter((entry) => isEntryADocument({ entry, documentTypeDef }))
            .map((documentEntry) => ({ documentEntry, documentTypeDef })),
      )

      const concurrencyLimit = os.cpus().length

      const documents = yield* $(
        pipe(
          documentEntriesWithDocumentTypeDef,
          T.forEachParN(concurrencyLimit, ({ documentEntry, documentTypeDef }) =>
            makeCacheItem({
              documentEntry,
              allEntries,
              allAssets,
              documentTypeDef,
              schemaDef,
              schemaOverrides,
              options,
            }),
          ),
          OT.withSpan('@contentlayer/source-contentlayer/fetchData:makeCacheItems', {
            attributes: { count: documentEntriesWithDocumentTypeDef.length },
          }),
        ),
      )

      const cacheItemsMap = Object.fromEntries(Chunk.map_(documents, (_) => [_.document._id, _]))

      return { cacheItemsMap }
    }),
    OT.withSpan('@contentlayer/source-contentlayer/fetchData:fetchAllDocuments', {
      attributes: { schemaDef: JSON.stringify(schemaDef), schemaOverrides_: JSON.stringify(schemaOverrides_) },
    }),
    T.mapError((error) => new core.SourceFetchDataError({ error, alreadyHandled: false })),
  )

const getAllEntries = (
  environment: Contentful.Environment,
): T.Effect<OT.HasTracer, UnknownContentfulError, Contentful.Entry[]> =>
  pipe(
    T.gen(function* ($) {
      const entries: Contentful.Entry[] = []
      const { total } = yield* $(environmentGetEntries({ limit: 0, environment }))
      const chunkSize = 500

      for (let offset = 0; offset <= total; offset += chunkSize) {
        const result = yield* $(environmentGetEntries({ limit: chunkSize, skip: offset, environment }))

        entries.push(...result.items)
      }

      return entries
    }),
    OT.withSpan('@contentlayer/source-contentlayer/fetchData:getAllEntries'),
  )

const getAllAssets = (
  environment: Contentful.Environment,
): T.Effect<OT.HasTracer, UnknownContentfulError, Contentful.Asset[]> =>
  pipe(
    T.gen(function* ($) {
      const entries: Contentful.Asset[] = []
      const { total } = yield* $(environmentGetAssets({ limit: 0, environment }))
      const chunkSize = 500

      for (let offset = 0; offset <= total; offset += chunkSize) {
        const result = yield* $(environmentGetAssets({ limit: chunkSize, skip: offset, environment }))

        entries.push(...result.items)
      }

      return entries
    }),
    OT.withSpan('@contentlayer/source-contentlayer/fetchData:getAllAssets'),
  )
