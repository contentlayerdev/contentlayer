import type * as core from '@contentlayer/core'
import type { PosixFilePath } from '@contentlayer/utils'
import { asMutableArray, posixFilePath } from '@contentlayer/utils'
import type { HasConsole} from '@contentlayer/utils/effect';
import { Chunk, HashMap , O, OT, pipe, T } from '@contentlayer/utils/effect'
import { fs } from '@contentlayer/utils/node'
import { Has } from '@effect-ts/core';
import glob from 'fast-glob'
import * as os from 'node:os'

import { FetchDataError } from '../errors/index.js'
import type { Flags } from '../index.js'
import type { ContentTypeMap, FilePathPatternMap } from '../types.js'
import type { HasDocumentTypeMapState } from './DocumentTypeMap.js'
import { DocumentTypeMapState, provideDocumentTypeMapState } from './DocumentTypeMap.js'
import * as SF from './DocumentTypeMap.js'
import { makeCacheItemFromFilePath } from './makeCacheItemFromFilePath.js'
// import {createPool} from './makeCacheItemFromFilePath.worker.js'

export const fetchAllDocuments = ({
    coreSchemaDef,
    filePathPatternMap,
    contentDirPath,
    contentDirInclude,
    contentDirExclude,
    contentTypeMap,
    flags,
    options,
    previousCache,
    verbose,
}: {
        coreSchemaDef: core.SchemaDef
        filePathPatternMap: FilePathPatternMap
        contentDirPath: PosixFilePath
        contentDirInclude: readonly PosixFilePath[]
        contentDirExclude: readonly PosixFilePath[]
        contentTypeMap: ContentTypeMap
        flags: Flags
        options: core.PluginOptions
        previousCache: core.DataCache.Cache | undefined
        verbose: boolean
    }): T.Effect<OT.HasTracer & HasConsole, fs.UnknownFSError | core.HandledFetchDataError, core.DataCache.Cache> =>
    pipe(
        T.gen(function* ($) {
            const allRelativeFilePaths = yield* $(
                getAllRelativeFilePaths({ contentDirPath, contentDirInclude, contentDirExclude }),
            )

            const concurrencyLimit = os.cpus().length

            // host -> worker
            const serialized = yield* $(pipe(
                SF.DocumentTypeMapState.update(_ => _.add('foo', posixFilePath('bar'))),
                T.chain(() => DocumentTypeMapState.get),
                T.tap(map => {
                    console.log('start', map);
                    return T.unit;
                }),
                T.chain(map => T.succeedWith(() => {
                    const r: Record<string, PosixFilePath[]> = {};
                    for (const [k, v] of map.map) {
                        r[k] = v;
                    }
                    return JSON.stringify(r);
                })),
                T.tap(serialized => {
                    console.log('serialized', serialized);
                    return T.unit;
                }),
                SF.provideDocumentTypeMapState,
            ));

            // worker input
            const layer = yield* $(pipe(
                T.succeedWith(() => {
                    const i: Record<string, PosixFilePath[]> = JSON.parse(serialized);
                    return Object.entries(i).reduce((map, [key, value]) => {
                        return HashMap.set(key, value)(map)
                    }, HashMap.make<string, PosixFilePath[]>());
                }),
                T.tap(deserialized => {
                    console.log('deserialized', deserialized);
                    return T.unit;
                }),
                T.map(map => new SF.DocumentTypeMap({map})),
                T.tap(instantiated => {
                    console.log('instantiated', instantiated);
                    return T.unit;
                }),
            ));

            // worker -> host
            yield* $(pipe(
                SF.DocumentTypeMapState.update(_ => _.add('qux', posixFilePath('baz'))),
                T.chain(() => SF.DocumentTypeMapState.get),
                T.tap(end => {
                    console.log('end', end);
                    return T.unit;
                }),
                T.provideSomeLayer(DocumentTypeMapState.Live(layer)),
            ));

            // TODO: deconstruct environment state
            // const run = createPool();
            // const environmentSeed = {};

            const { dataErrors, documents } = yield* $(
                pipe(
                    allRelativeFilePaths,
                    // TODO: parallalize
                    T.forEachParN(concurrencyLimit, (relativeFilePath) =>
                        makeCacheItemFromFilePath({
                            relativeFilePath,
                            filePathPatternMap,
                            coreSchemaDef,
                            contentDirPath,
                            options,
                            previousCache,
                            contentTypeMap,
                        }),
                    ),
                    T.map(Chunk.partitionThese),
                    T.map(({ tuple: [errors, docs] }) => ({ dataErrors: Chunk.toArray(errors), documents: Chunk.toArray(docs) })),
                ),
            )

            const singletonDataErrors = yield* $(validateSingletonDocuments({ coreSchemaDef, filePathPatternMap }))

            yield* $(
                FetchDataError.handleErrors({
                    errors: [...dataErrors, ...singletonDataErrors],
                    documentCount: allRelativeFilePaths.length,
                    flags,
                    options,
                    schemaDef: coreSchemaDef,
                    contentDirPath,
                    verbose,
                }),
            )

            const cacheItemsMap = Object.fromEntries(documents.map((_) => [_.document._id, _]))

            return { cacheItemsMap }
        }),
        // TODO: Figure out life cycle of this.
        provideDocumentTypeMapState,
        OT.withSpan('@contentlayer/source-local/fetchData:fetchAllDocuments', { attributes: { contentDirPath } }),
    )

const getAllRelativeFilePaths = ({
    contentDirPath,
    contentDirInclude,
    contentDirExclude,
}: {
        contentDirPath: string
        contentDirInclude: readonly PosixFilePath[]
        contentDirExclude: readonly PosixFilePath[]
    }): T.Effect<OT.HasTracer, fs.UnknownFSError, PosixFilePath[]> => {
    const getPatternPrefix = (paths_: readonly string[]) => {
        const paths = paths_
        .map((_) => _.trim())
        .filter((_) => _ !== '.' && _ !== './')
        .map((_) => (_.endsWith('/') ? _ : `${_}/`))

        if (paths.length === 0) return ''
        if (paths.length === 1) return paths[0]
        return `{${paths.join(',')}}`
    }

    const filePathPattern = '**/*.{md,mdx,json,yaml,yml}'
    const pattern = `${getPatternPrefix(contentDirInclude)}${filePathPattern}`

    return pipe(
        T.tryCatchPromise(
            () => glob(pattern, { cwd: contentDirPath, ignore: asMutableArray(contentDirExclude) }),
            (error) => new fs.UnknownFSError({ error }),
        ),
        T.map((_) => _.map(posixFilePath)),
        OT.withSpan('@contentlayer/source-local/fetchData:getAllRelativeFilePaths'),
    )
}

const validateSingletonDocuments = ({
    coreSchemaDef,
    filePathPatternMap,
}: {
        coreSchemaDef: core.SchemaDef
        filePathPatternMap: FilePathPatternMap
    }): T.Effect<HasDocumentTypeMapState, never, FetchDataError.SingletonDocumentNotFoundError[]> =>
    T.gen(function* ($) {
        const singletonDocumentDefs = Object.values(coreSchemaDef.documentTypeDefMap).filter(
            (documentTypeDef) => documentTypeDef.isSingleton,
        )

        const documentTypeMap = yield* $(DocumentTypeMapState.get)

        const invertedFilePathPattnernMap = invertRecord(filePathPatternMap)

        return singletonDocumentDefs
            .filter(
                (documentTypeDef) =>
                    pipe(
                        documentTypeMap.getFilePaths(documentTypeDef.name),
                        O.map((_) => _.length),
                        O.getOrElse(() => 0),
                    ) !== 1,
            )
            .map(
                (documentTypeDef) =>
                    new FetchDataError.SingletonDocumentNotFoundError({
                        documentTypeName: documentTypeDef.name,
                        filePath: invertedFilePathPattnernMap[documentTypeDef.name],
                    }),
            )
    })

const invertRecord = (record: Record<string, string>): Record<string, string> =>
    pipe(Object.entries(record), (entries) => entries.map(([key, value]) => [value, key]), Object.fromEntries)
