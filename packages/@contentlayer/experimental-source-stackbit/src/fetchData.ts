import type * as core from '@contentlayer/core'
import type { ContentStoreTypes } from '@contentlayer/experimental-stackbit-core'
import { createContentStore } from '@contentlayer/experimental-stackbit-core'
import type { fs } from '@contentlayer/utils'
import { mapObjectValues, notImplemented } from '@contentlayer/utils'
import type { HasConsole, OT } from '@contentlayer/utils/effect'
import { E, Effect, M, pipe, S } from '@contentlayer/utils/effect'
import type { Config } from '@stackbit/sdk'

export const fetchData = ({
  stackbitConfig,
}: {
  coreSchemaDef: core.SchemaDef
  stackbitConfig: Config
  options: core.PluginOptions
  skipCachePersistence?: boolean
  verbose: boolean
}): S.Stream<
  OT.HasTracer & core.HasCwd & HasConsole & fs.HasFs,
  never,
  E.Either<core.SourceFetchDataError, core.DataCache.Cache>
> =>
  pipe(
    M.gen(function* ($) {
      const contentStore = createContentStore({})

      yield* $(Effect.tryPromiseOrDie(() => contentStore.init({ stackbitConfig })))

      const docs = contentStore.getDocuments()
      // console.dir(docs, { depth: null, colors: true })

      return S.fromValue(E.right(makeDataCacheFromStackbitDocuments(docs)))
    }),
    S.unwrapManaged,
  )

const makeDataCacheFromStackbitDocuments = (docs: ContentStoreTypes.Document[]): core.DataCache.Cache => {
  const cacheItemsMap = Object.fromEntries(
    docs.map((doc) => {
      const id = doc.srcObjectId
      const docFieldValues = mapObjectValues(doc.fields, (_fieldName, field) => {
        if (field.type === 'reference') {
          return notImplemented(`field type ${field.type} not yetimplemented`)
        }

        if (['string', 'number', 'boolean'].includes(field.type)) {
          return (field as any).value
        }

        return notImplemented(`field type ${field.type} not yetimplemented`)
      })
      const document: core.Document = {
        ...docFieldValues,
        // TODO make dynamic
        type: doc.srcModelName,
        _id: id,
        _raw: doc,
      }

      const documentHash = hashString(JSON.stringify(docFieldValues))

      const cacheItem: core.DataCache.CacheItem = {
        document,
        hasWarnings: false,
        documentHash,
        documentTypeName: doc.srcModelName,
      }
      return [id, cacheItem] as const
    }),
  )

  // console.dir(cacheItemsMap, { depth: null, colors: true })

  return { cacheItemsMap }
}

const hashString = (str: string) => {
  let hash = 0
  if (str.length == 0) {
    return hash + ''
  }
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}
