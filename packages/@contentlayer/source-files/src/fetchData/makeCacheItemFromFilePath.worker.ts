import type * as core from '@contentlayer/core'
import type { PosixFilePath } from '@contentlayer/utils'
import type { HasConsole, OT , These } from '@contentlayer/utils/effect';
import {pipe, T } from '@contentlayer/utils/effect'
import Pool from 'piscina';

import type { FetchDataError } from '../errors/index.js'
import type { ContentTypeMap, FilePathPatternMap } from '../types.js'
import type { HasDocumentTypeMapState } from './DocumentTypeMap.js'
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
export type DTO = {
    input: Input;
    environmentSeed: any;
}

// FIXME: naming
// This runs on the host, what is passed into the worker at `pool.run` has to
// be serializable.
export function createPool() {
    // I believe, by default, #workers = #cpu cores, which is probably what we want?
    const pool = new Pool({
        // FIXME: get path dynamically
        filename: '/home/ts/dev/code/contentlayer/packages/@contentlayer/source-files/dist/fetchData/makeCacheItemFromFilePath.worker.js',
    });

    return (dto: DTO): T.Effect<
          OT.HasTracer & HasConsole & HasDocumentTypeMapState,
          never,
          These.These<FetchDataError.FetchDataError, core.DataCache.CacheItem>
        > =>
        pipe(
            T.promise(() => pool.run(dto, {name: 'makeCacheItemFromFilePath'})),
            T.chain(({_tag, value}) =>
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
export const makeCacheItemFromFilePath = (dto: DTO) => {
        // TODO: construct env
        const env = undefined as unknown as OT.HasTracer & HasConsole & HasDocumentTypeMapState;
        return pipe(
            _.makeCacheItemFromFilePath(dto.input),
            T.fold(
                value => ({_tag: 'left', value} as const),
                value => ({_tag: 'right', value} as const),
            ),
            T.provideAll(env),
            T.runPromise,
        );
}
