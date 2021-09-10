import type { E } from '@contentlayer/utils/effect'
import { Chunk, OT, pipe, S, T } from '@contentlayer/utils/effect'
import { fileOrDirExistsEff, fs } from '@contentlayer/utils/node'
import * as path from 'path'
import pkgUp from 'pkg-up'

import { ConfigNoDefaultExportError, ConfigReadError, NoConfigFoundError } from '../errors'
import type { SourcePlugin } from '../plugin'
import * as esbuild from './esbuild'

type GetConfigError =
  | esbuild.EsbuildError
  | NoConfigFoundError
  | fs.ReadFileError
  | fs.UnknownFSError
  | fs.MkdirError
  | ConfigReadError
  | ConfigNoDefaultExportError

// TODO rename to getSource
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

// TODO rename to getSourceWatch
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
    T.chain(({ configPath }) => makeTmpDirAndResolveEntryPoint({ cwd, configPath })),
    T.either,
  )

  return pipe(
    S.fromEffect(resolveParams),
    // S.tap(effectUtils.log),
    S.chainMapEitherRight(({ configPath, outfilePath }) =>
      pipe(
        esbuild.makeAndSubscribe({
          entryPoints: [configPath],
          outfile: outfilePath,
          sourcemap: true,
          platform: 'node',
          external: [
            'esbuild',
            // TODO make dynamic
            // needed for source-sanity
            '@sanity/core/lib/actions/graphql/getSanitySchema',

            // NOTE needed since we don't bundle the contentlayer CLI. we should fix this soon.
            'js-yaml',

            // contentlayer
            'contentlayer/*',
            '@contentlayer/*',
            '@effect-ts/*',
            'highlight.js',

            // needed to make chokidar work on OSX (in source-files)
            'fsevents',

            // needed for shiki
            'onigasm',
            'shiki',
          ],
          target: 'es2018',
          format: 'cjs',
          // needed in case models are colocated with React components
          jsx: 'transform',
          bundle: true,
          logLevel: 'silent',
          plugins: [contentlayerGenPlugin()],
        }),
        S.mapEffectEitherRight((result) => getConfigFromResult({ result, configPath, outfilePath })),
      ),
    ),
  )
}

/** Fix esbuild binary path if not found (e.g. in local development setup) */
const ensureEsbuildBin: T.Effect<OT.HasTracer, fs.ReadFileError | fs.UnknownFSError, void> = T.gen(function* ($) {
  const esbuildBinPath = path.join(__dirname, '..', 'bin', 'esbuild')
  const esbuildBinExists = yield* $(fs.fileOrDirExistsEff(esbuildBinPath))

  if (!esbuildBinExists) {
    const esbuildPackageJsonPath = yield* $(pkgUpEff({ cwd: path.dirname(require.resolve('esbuild')) }))
    const esbuildPackagePath = path.dirname(esbuildPackageJsonPath!)
    // wrapping in try/catch is needed to surpress esbuild warning about `require`
    try {
      const esbuildPackageJson = require(esbuildPackageJsonPath!)
      const binPath = path.join(esbuildPackagePath, esbuildPackageJson['bin']['esbuild'])
      process.env['ESBUILD_BINARY_PATH'] = binPath
    } catch (_) {}
  }
})

const resolveConfigPath = ({
  configPath,
  cwd,
}: {
  configPath?: string
  cwd: string
}): T.Effect<unknown, NoConfigFoundError | fs.ReadFileError, string> =>
  T.gen(function* ($) {
    if (configPath) {
      if (path.isAbsolute(configPath)) {
        return configPath
      }

      return path.join(cwd, configPath)
    }

    const defaultFilePaths = [path.join(cwd, 'contentlayer.config.ts'), path.join(cwd, 'contentlayer.config.js')]
    const foundDefaultFiles = yield* $(pipe(defaultFilePaths, T.forEachPar(fileOrDirExistsEff), T.map(Chunk.toArray)))
    const foundDefaultFile = defaultFilePaths[foundDefaultFiles.findIndex((_) => _)]
    if (foundDefaultFile) {
      return foundDefaultFile
    }

    return yield* $(T.fail(new NoConfigFoundError({ cwd, configPath })))
  })

const makeTmpDirAndResolveEntryPoint = ({ cwd, configPath }: { cwd: string; configPath: string }) =>
  T.gen(function* ($) {
    const packageJsonPath = yield* $(pkgUpEff({ cwd }))
    const packageDir = path.join(packageJsonPath!, '..')
    // `tmpDir` needs to be in package directory for `require` statements to work
    const tmpDir = path.join(packageDir, 'node_modules', '.tmp', 'contentlayer', 'config')
    yield* $(fs.mkdirp(tmpDir))
    const outfilePath = path.join(tmpDir, 'config.js')

    return { outfilePath, tmpDir, configPath }
  })

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
        console.error(`Esbuild warnings:`)
        console.error(unknownWarnings)
      }

      // Needed in case of re-loading when watching the config file for changes
      delete require.cache[require.resolve(outfilePath)]

      // Needed in order for source maps of dynamic file to work
      require('source-map-support').install()

      const exports = yield* $(
        T.tryCatch(
          () => require(outfilePath),
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

const pkgUpEff = (options: pkgUp.Options): T.Effect<unknown, fs.UnknownFSError, string | null> =>
  T.tryCatchPromise(
    () => pkgUp(options),
    (error: any) => new fs.UnknownFSError({ error }),
  )
