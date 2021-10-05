import type { E } from '@contentlayer/utils/effect'
import { Chunk, OT, pipe, S, T } from '@contentlayer/utils/effect'
import type { GetContentlayerVersionError } from '@contentlayer/utils/node'
import { fs } from '@contentlayer/utils/node'
import { createRequire } from 'module'
import * as path from 'path'
import pkgUp from 'pkg-up'
import { fileURLToPath } from 'url'

import { ConfigNoDefaultExportError, ConfigReadError, EsbuildBinNotFoundError, NoConfigFoundError } from '../errors.js'
import { ArtifactsDir } from '../index.js'
import type { SourcePlugin } from '../plugin.js'
import * as esbuild from './esbuild.js'

// https://stackoverflow.com/questions/54977743/do-require-resolve-for-es-modules
const require = createRequire(import.meta.url)

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
  cwd,
}: {
  configPath?: string
  cwd: string
}): T.Effect<OT.HasTracer, GetConfigError, SourcePlugin> =>
  pipe(
    getConfigWatch({ configPath, cwd }),
    S.take(1),
    S.runCollect,
    T.map((_) => _[0]!),
    T.rightOrFail,
    OT.withSpan('@contentlayer/core/getConfig:getConfig', { attributes: { configPath, cwd } }),
  )

export const getConfigWatch = ({
  configPath: configPath_,
  cwd,
}: {
  configPath?: string
  cwd: string
}): S.Stream<OT.HasTracer, never, E.Either<GetConfigError, SourcePlugin>> => {
  const resolveParams = pipe(
    T.structPar({
      __: ensureEsbuildBin,
      configPath: resolveConfigPath({ configPath: configPath_, cwd }),
    }),
    T.chainMergeObject(() => makeTmpDirAndResolveEntryPoint({ cwd })),
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
          target: 'es2018',
          format: 'esm',
          // needed in case models are co-located with React components
          jsx: 'transform',
          bundle: true,
          logLevel: 'silent',
          plugins: [contentlayerGenPlugin(), makeAllPackagesExternalPlugin()],
        }),
        S.mapEffectEitherRight((result) => getConfigFromResult({ result, configPath, outfilePath })),
      ),
    ),
  )
}

/** Fix esbuild binary path if not found (e.g. in local development setup) */
const ensureEsbuildBin: T.Effect<OT.HasTracer, fs.StatError | fs.UnknownFSError | EsbuildBinNotFoundError, void> =
  T.gen(function* ($) {
    const esbuildBinPath = path.join(__dirname, '..', 'bin', 'esbuild')
    const esbuildBinExists = yield* $(fs.fileOrDirExists(esbuildBinPath))

    if (!esbuildBinExists) {
      const esbuildPackageJsonPath = yield* $(pkgUpEff({ cwd: path.dirname(require.resolve('esbuild')) }))
      const esbuildPackagePath = path.dirname(esbuildPackageJsonPath!)
      const binPath = yield* $(getEsbuildBinPath(esbuildPackagePath))
      process.env['ESBUILD_BINARY_PATH'] = binPath
    }
  })

const getEsbuildBinPath = (
  esbuildPackagePath: string,
): T.Effect<unknown, fs.StatError | EsbuildBinNotFoundError, string> =>
  T.gen(function* ($) {
    // depending on whether Yarn is used or something else, the esbuild binary is located somewhere else
    const binPathWhenUsingYarn = path.join(esbuildPackagePath, 'esbuild')
    const binPathWhenNotUsingYarn = path.join(esbuildPackagePath, 'bin', 'esbuild')

    if (yield* $(fs.fileOrDirExists(binPathWhenUsingYarn))) {
      return binPathWhenUsingYarn
    }

    if (yield* $(fs.fileOrDirExists(binPathWhenNotUsingYarn))) {
      return binPathWhenNotUsingYarn
    }

    return yield* $(T.fail(new EsbuildBinNotFoundError()))
  })

const resolveConfigPath = ({
  configPath,
  cwd,
}: {
  configPath?: string
  cwd: string
}): T.Effect<unknown, NoConfigFoundError | fs.StatError, string> =>
  T.gen(function* ($) {
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

const makeTmpDirAndResolveEntryPoint = ({ cwd }: { cwd: string }) =>
  pipe(
    ArtifactsDir.mkdirCache({ cwd }),
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

      // Needed in case of re-loading when watching the config file for changes
      const importFresh = async (modulePath: string) => import(`${modulePath}?x=${new Date()}`)

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

const contentlayerGenPlugin = (): esbuild.Plugin => ({
  name: 'contentlayer-gen',
  setup(build) {
    build.onResolve({ filter: /^\.contentlayer\// }, (args) => ({
      path: args.path,
      namespace: 'contentlayer-gen',
    }))

    // // TODO need to come up with a better `filter`
    // build.onLoad({ filter: /\/contentlayer\/.*/, namespace: 'file' }, async (args) => {
    //   // NOTE needed to deal with TypeScript sources as esbuild plugins don't seem to be composable right now
    //   const result = await esbuild.build({
    //     entryPoints: [args.path],
    //     write: false,
    //   })
    //   const contents = `var __dirname = "${path.dirname(args.path)}";\n${result.outputFiles![0].text}`
    //   return { contents }
    // })

    build.onLoad({ filter: /.*/, namespace: 'contentlayer-gen' }, () => ({
      contents: '// empty',
    }))
  },
})

// TODO also take tsconfig.json `paths` mapping into account
const makeAllPackagesExternalPlugin = (): esbuild.Plugin => ({
  name: 'make-all-packages-external',
  setup: (build) => {
    const filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/ // Must not start with "/" or "./" or "../"
    build.onResolve({ filter }, (args) => ({ path: args.path, external: true }))
  },
})

const pkgUpEff = (options: pkgUp.Options): T.Effect<unknown, fs.UnknownFSError, string | null> =>
  T.tryCatchPromise(
    () => pkgUp(options),
    (error: any) => new fs.UnknownFSError({ error }),
  )
