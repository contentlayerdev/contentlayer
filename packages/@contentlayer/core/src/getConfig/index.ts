import { traceAsyncFn } from '@contentlayer/utils'
import { fileOrDirExistsEff } from '@contentlayer/utils/node'
import { pipe } from '@effect-ts/core'
import { Tagged } from '@effect-ts/core/Case'
import * as Chunk from '@effect-ts/core/Collections/Immutable/Chunk'
import * as T from '@effect-ts/core/Effect'
import * as S from '@effect-ts/core/Effect/Experimental/Stream'
import * as OT from '@effect-ts/otel'
import type * as esbuild from 'esbuild'
import { promises as fs } from 'fs'
import * as path from 'path'
import pkgUp from 'pkg-up'

import type { SourcePlugin } from '../plugin'
import type { EsbuildError } from './esbuild'
import { makeAndSubscribe } from './esbuild'

// TODO rename to getSource
export const getConfig = ({
  configPath,
  cwd,
}: {
  configPath?: string
  cwd: string
}): T.Effect<OT.HasTracer, EsbuildError | Error | NoConfigFoundError, SourcePlugin> =>
  pipe(
    getConfigWatch({ configPath, cwd }),
    S.take(1),
    S.runCollect,
    T.map(Chunk.unsafeHead),
    OT.withSpan('@contentlayer/core/getConfig:getConfig', { attributes: { configPath, cwd } }),
  )

// TODO rename to getSourceWatch
export const getConfigWatch = ({
  configPath: configPath_,
  cwd,
}: {
  configPath?: string
  cwd: string
}): S.Stream<OT.HasTracer, EsbuildError | Error | NoConfigFoundError, SourcePlugin> => {
  const resolveParams = pipe(
    T.structPar({
      __: ensureEsbuildBinEff(),
      configPath: resolveConfigPath({ configPath: configPath_, cwd }),
    }),
    T.chain(({ configPath }) => makeTmpDirAndResolveEntryPointEff({ cwd, configPath })),
  )

  return pipe(
    S.fromEffect(resolveParams),
    S.chain(({ configPath, outfilePath }) =>
      pipe(
        makeAndSubscribe({
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
            // 'contentlayer/*',
            // '@contentlayer/*',

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
        S.mapEff((result) => getConfigFromResultEff({ result, configPath, outfilePath })),
      ),
    ),
  )
}

const ensureEsbuildBinEff = (): T.Effect<unknown, Error, void> => T.tryCatchPromise(ensureEsbuildBin, (e) => e as Error)

/** Fix esbuild binary path if not found (e.g. in local development setup) */
const ensureEsbuildBin = async (): Promise<void> => {
  const esbuildBinPath = path.join(__dirname, '..', 'bin', 'esbuild')
  const esbuildBinExists = await fs
    .stat(esbuildBinPath)
    .then(() => true)
    .catch(() => false)
  if (!esbuildBinExists) {
    const esbuildPackageJsonPath = await pkgUp({ cwd: path.dirname(require.resolve('esbuild')) })
    const esbuildPackagePath = path.dirname(esbuildPackageJsonPath!)
    // wrapping in try/catch is needed to surpress esbuild warning about `require`
    try {
      const esbuildPackageJson = require(esbuildPackageJsonPath!)
      const binPath = path.join(esbuildPackagePath, esbuildPackageJson['bin']['esbuild'])
      process.env['ESBUILD_BINARY_PATH'] = binPath
    } catch (_) {}
  }
}

export class NoConfigFoundError extends Tagged('NoConfigFoundError')<{
  readonly configPath?: string
  readonly cwd: string
}> {
  toString = () =>
    this.configPath
      ? `Couldn't find ${this.configPath}`
      : `Could not find contentlayer.config.ts or contentlayer.config.js in ${this.cwd}`
}

const resolveConfigPath = ({
  configPath,
  cwd,
}: {
  configPath?: string
  cwd: string
}): T.Effect<unknown, NoConfigFoundError, string> =>
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

const makeTmpDirAndResolveEntryPointEff = ({ cwd, configPath }: { cwd: string; configPath: string }) =>
  T.tryCatchPromise(
    () => makeTmpDirAndResolveEntryPoint({ configPath, cwd }),
    (e) => e as Error,
  )

const makeTmpDirAndResolveEntryPoint = async ({ cwd, configPath }: { cwd: string; configPath: string }) => {
  const packageJsonPath = await pkgUp({ cwd })
  const packageDir = path.join(packageJsonPath!, '..')
  // `tmpDir` needs to be in package directory for `require` statements to work
  const tmpDir = path.join(packageDir, 'node_modules', '.tmp', 'contentlayer', 'config')
  await fs.mkdir(tmpDir, { recursive: true })
  const outfilePath = path.join(tmpDir, 'config.js')

  return { outfilePath, tmpDir, configPath }
}

const getConfigFromResultEff = ({
  result,
  configPath,
  outfilePath,
}: {
  result: esbuild.BuildResult
  /** configPath only needed for error message */
  configPath: string
  outfilePath: string
}): T.Effect<OT.HasTracer, Error, SourcePlugin> =>
  pipe(
    T.tryCatchPromise(
      () => getConfigFromResult({ result, configPath, outfilePath }),
      (e) => e as Error,
    ),
    OT.withSpan('@contentlayer/core/getConfig:getConfigFromResult', { attributes: { configPath, outfilePath } }),
  )

const getConfigFromResult = (async ({
  result,
  configPath,
  outfilePath,
}: {
  result: esbuild.BuildResult
  /** configPath only needed for error message */
  configPath: string
  outfilePath: string
}): Promise<SourcePlugin> => {
  const unknownWarnings = result.warnings.filter(
    (warning) =>
      warning.text.match(
        /Import \".*\" will always be undefined because the file \"contentlayer-gen:.contentlayer\/(data|types)\" has no exports/,
      ) === null,
  )
  if (unknownWarnings.length > 0) {
    console.error(`Esbuild errors:`)
    console.error(unknownWarnings)
  }

  // wrapping in try/catch is needed to surpress esbuild warning
  try {
    // Needed in case of re-loading when watching the config file for changes
    delete require.cache[require.resolve(outfilePath)]

    // Needed in order for source maps of dynamic file to work
    require('source-map-support').install()

    const exports = require(outfilePath)
    if (!('default' in exports)) {
      throw new Error(`Provided config path (${configPath}) doesn't have a default export.`)
    }

    return exports.default
  } catch (error) {
    console.error(error)
    throw error
  }
})['|>'](traceAsyncFn('@contentlayer/core/getConfig:getConfigFromResult', ['configPath', 'outfilePath']))

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
