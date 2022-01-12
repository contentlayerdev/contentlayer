import type { E } from '@contentlayer/utils/effect'
import { Chunk, OT, pipe, S, T } from '@contentlayer/utils/effect'
import type { GetContentlayerVersionError } from '@contentlayer/utils/node'
import { fs } from '@contentlayer/utils/node'
import * as path from 'path'

import type { HasCwd } from '../cwd.js'
import { getCwd } from '../cwd.js'
import type { EsbuildBinNotFoundError } from '../errors.js'
import { ConfigNoDefaultExportError, ConfigReadError, NoConfigFoundError } from '../errors.js'
import { ArtifactsDir } from '../index.js'
import type { SourcePlugin } from '../plugin.js'
import * as esbuild from './esbuild.js'

type GetConfigError =
  | esbuild.EsbuildError
  | NoConfigFoundError
  | fs.StatError
  | fs.UnknownFSError
  | fs.MkdirError
  | EsbuildBinNotFoundError
  | ConfigReadError
  | ConfigNoDefaultExportError
  | GetContentlayerVersionError

export const getConfig = ({
  configPath,
}: {
  configPath?: string
}): T.Effect<OT.HasTracer & HasCwd, GetConfigError, SourcePlugin> =>
  pipe(
    getConfigWatch({ configPath }),
    S.take(1),
    S.runCollect,
    T.map(Chunk.unsafeHead),
    T.rightOrFail,
    OT.withSpan('@contentlayer/core/getConfig:getConfig', { attributes: { configPath } }),
  )

export const getConfigWatch = ({
  configPath: configPath_,
}: {
  configPath?: string
}): S.Stream<OT.HasTracer & HasCwd, never, E.Either<GetConfigError, SourcePlugin>> => {
  const resolveParams = pipe(
    T.structPar({ configPath: resolveConfigPath({ configPath: configPath_ }) }),
    T.chainMergeObject(() => makeTmpDirAndResolveEntryPoint),
    T.either,
  )

  return pipe(
    S.fromEffect(resolveParams),
    S.chainMapEitherRight(({ configPath, outfilePath }) =>
      pipe(
        esbuild.makeAndSubscribe({
          entryPoints: [configPath],
          outfile: outfilePath,
          sourcemap: true,
          platform: 'node',
          target: 'es2020',
          format: 'esm',
          // needed in case models are co-located with React components
          jsx: 'transform',
          bundle: true,
          logLevel: 'silent',
          plugins: [contentlayerGenPlugin(), makeAllPackagesExternalPlugin(configPath)],
        }),
        S.mapEffectEitherRight((result) => getConfigFromResult({ result, configPath, outfilePath })),
      ),
    ),
  )
}

const resolveConfigPath = ({
  configPath,
}: {
  configPath?: string
}): T.Effect<HasCwd & OT.HasTracer, NoConfigFoundError | fs.StatError, string> =>
  T.gen(function* ($) {
    const cwd = yield* $(getCwd)

    if (configPath) {
      if (path.isAbsolute(configPath)) {
        return configPath
      }

      return path.join(cwd, configPath)
    }

    const defaultFilePaths = [path.join(cwd, 'contentlayer.config.ts'), path.join(cwd, 'contentlayer.config.js')]
    const foundDefaultFiles = yield* $(pipe(defaultFilePaths, T.forEachPar(fs.fileOrDirExists), T.map(Chunk.toArray)))
    const foundDefaultFile = defaultFilePaths[foundDefaultFiles.findIndex((_) => _)]
    if (foundDefaultFile) {
      return foundDefaultFile
    }

    return yield* $(T.fail(new NoConfigFoundError({ cwd, configPath })))
  })

const makeTmpDirAndResolveEntryPoint = pipe(
  ArtifactsDir.mkdirCache,
  T.map((cacheDir) => ({ outfilePath: path.join(cacheDir, 'compiled-contentlayer-config.mjs') })),
)

const getConfigFromResult = ({
  result,
  configPath,
  outfilePath,
}: {
  result: esbuild.BuildResult
  /** configPath only needed for error message */
  configPath: string
  outfilePath: string
}): T.Effect<OT.HasTracer, never, E.Either<ConfigReadError | ConfigNoDefaultExportError, SourcePlugin>> =>
  pipe(
    T.gen(function* ($) {
      const unknownWarnings = result.warnings.filter(
        (warning) =>
          warning.text.match(
            /Import \".*\" will always be undefined because the file \"contentlayer-gen:.contentlayer\/(data|types)\" has no exports/,
          ) === null,
      )

      if (unknownWarnings.length > 0) {
        console.error(`Contentlayer esbuild warnings:`)
        console.error(unknownWarnings)
      }

      // Needed in order for source maps of dynamic file to work
      yield* $(
        T.tryCatchPromise(
          async () => (await import('source-map-support')).install(),
          (error) => new ConfigReadError({ error, configPath }),
        ),
      )

      // NOTES:
      // 1) `?x=` suffix needed in case of re-loading when watching the config file for changes
      // 2) `file://` prefix is needed for Windows to work properly
      const importFresh = async (modulePath: string) => import(`file://${modulePath}?x=${new Date()}`)

      const exports = yield* $(
        T.tryCatchPromise(
          () => importFresh(outfilePath),
          (error) => new ConfigReadError({ error, configPath }),
        ),
      )
      if (!('default' in exports)) {
        return yield* $(T.fail(new ConfigNoDefaultExportError({ configPath, availableExports: Object.keys(exports) })))
      }

      // Note currently `makeSource` returns a Promise but we should reconsider that design decision
      const config = yield* $(
        T.tryCatchPromise(
          async () => exports.default,
          (error) => new ConfigReadError({ error, configPath }),
        ),
      )

      return config as SourcePlugin
    }),
    OT.withSpan('@contentlayer/core/getConfig:getConfigFromResult', { attributes: { configPath, outfilePath } }),
    T.either,
  )

/**
 * This esbuild plugin is needed in some cases where users import code that imports from '.contentlayer/*'
 * (e.g. when co-locating document type definitions with React components).
 */
const contentlayerGenPlugin = (): esbuild.Plugin => ({
  name: 'contentlayer-gen',
  setup(build) {
    build.onResolve({ filter: /^\.contentlayer\// }, (args) => ({
      path: args.path,
      namespace: 'contentlayer-gen',
    }))

    build.onLoad({ filter: /.*/, namespace: 'contentlayer-gen' }, () => ({
      contents: '// empty',
    }))
  },
})

// TODO also take tsconfig.json `paths` mapping into account
const makeAllPackagesExternalPlugin = (configPath: string): esbuild.Plugin => ({
  name: 'make-all-packages-external',
  setup: (build) => {
    const filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/ // Must not start with "/" or "./" or "../"
    build.onResolve({ filter }, (args) => {
      // avoid marking config file as external
      if (args.path.includes(configPath)) {
        return { path: args.path, external: false }
      }

      return { path: args.path, external: true }
    })
  },
})
