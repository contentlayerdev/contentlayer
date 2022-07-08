import type * as core from '@contentlayer/core'
import type { PosixFilePath } from '@contentlayer/utils'
import { provideDummyTracing } from '@contentlayer/utils'
import type { HasConsole, OT, These } from '@contentlayer/utils/effect'
import { pipe, provideConsole, T } from '@contentlayer/utils/effect'
import Pool from 'piscina'

import type { FetchDataError } from '../errors/index.js'
import type { ContentTypeMap, FilePathPatternMap } from '../types.js'
import type { HasDocumentTypeMapState } from './DocumentTypeMap.js'
import { provideDocumentTypeMapState } from './DocumentTypeMap.js'
import * as _ from './makeCacheItemFromFilePath.js'

export type Input = {
  relativeFilePath: PosixFilePath
  filePathPatternMap: FilePathPatternMap
  coreSchemaDef: core.SchemaDef
  contentDirPath: PosixFilePath
  options: core.PluginOptions
  previousCache: core.DataCache.Cache | undefined
  contentTypeMap: ContentTypeMap
}

// FIXME: naming
// This runs on the host, what is passed into the worker at `pool.run` has to
// be serializable.
export function createPool() {
  // I believe, by default, #workers = #cpu cores, which is probably what we want?
  const pool = new Pool({
    // FIXME: get path dynamically
    filename:
      '/home/ts/dev/code/contentlayer/packages/@contentlayer/source-files/dist/fetchData/makeCacheItemFromFilePath.worker.js',
  })

  return (
    payload: Input,
  ): T.Effect<
    OT.HasTracer & HasConsole & HasDocumentTypeMapState,
    never,
    These.These<FetchDataError.FetchDataError, core.DataCache.CacheItem>
  > =>
    pipe(
      T.promise(() => pool.run(payload, { name: 'makeCacheItemFromFilePath' })),
      T.chain(({ _tag, value }) =>
        T.if_(
          _tag === 'right',
          () => T.succeed(value),
          // FIXME: Signature claims it doesn't fail.
          () => T.die(value),
        ),
      ),
    )
}

// This runs in the worker, with the input coming via the "wire" from the host,
// the return value has to be serializable.
export function makeCacheItemFromFilePath(payload: Input) {
  return pipe(
    _.makeCacheItemFromFilePath(payload),
    // T.fold(
    //     value => ({ _tag: 'left', value } as const),
    //     value => ({ _tag: 'right', value } as const)
    // ),
    provideDocumentTypeMapState,
    provideConsole,
    provideDummyTracing,
    T.runPromise,
  )
}

// const serialized = yield* $(
//   pipe(
//     SF.DocumentTypeMapState.update((_) => _.add('foo', posixFilePath('bar'))),
//     T.chain(() => DocumentTypeMapState.get),
//     T.tap((map) => {
//       console.log('start', map)
//       return T.unit
//     }),
//     T.chain((map) =>
//       T.succeedWith(() => {
//         const r: Record<string, PosixFilePath[]> = {}
//         for (const [k, v] of map.map) {
//           r[k] = v
//         }
//         return JSON.stringify(r)
//       }),
//     ),
//     T.tap((serialized) => {
//       console.log('serialized', serialized)
//       return T.unit
//     }),
//     SF.provideDocumentTypeMapState,
//   ),
// )
//
// // worker input
// const layer = yield* $(
//   pipe(
//     T.succeedWith(() => {
//       const i: Record<string, PosixFilePath[]> = JSON.parse(serialized)
//       return Object.entries(i).reduce((map, [key, value]) => {
//         return HashMap.set(key, value)(map)
//       }, HashMap.make<string, PosixFilePath[]>())
//     }),
//     T.tap((deserialized) => {
//       console.log('deserialized', deserialized)
//       return T.unit
//     }),
//     T.map((map) => new SF.DocumentTypeMap({ map })),
//     T.tap((instantiated) => {
//       console.log('instantiated', instantiated)
//       return T.unit
//     }),
//   ),
// )
//
// // worker -> host
// yield* $(
//   pipe(
//     SF.DocumentTypeMapState.update((_) => _.add('qux', posixFilePath('baz'))),
//     T.chain(() => SF.DocumentTypeMapState.get),
//     T.tap((end) => {
//       console.log('end', end)
//       return T.unit
//     }),
//     T.provideSomeLayer(DocumentTypeMapState.Live(layer)),
//   ),
// )
