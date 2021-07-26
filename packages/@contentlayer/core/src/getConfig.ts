import { promiseMap, traceAsyncFn } from '@contentlayer/utils'
import { fileOrDirExists } from '@contentlayer/utils/node'
import * as esbuild from 'esbuild'
import { promises as fs } from 'fs'
import * as path from 'path'
import pkgUp from 'pkg-up'
import { firstValueFrom, forkJoin, Observable } from 'rxjs'
import { mergeMap } from 'rxjs/operators'

import type { SourcePlugin } from './plugin'

// TODO rename to getSourceWatch
export const getConfigWatch = ({ configPath, cwd }: { configPath?: string; cwd: string }): Observable<SourcePlugin> => {
  return getConfig_({ configPath, cwd, watch: true })
}

// TODO rename to getSource
export const getConfig = (async ({ configPath, cwd }: { configPath?: string; cwd: string }): Promise<SourcePlugin> => {
  return firstValueFrom(getConfig_({ configPath, cwd, watch: false }))
})['|>'](traceAsyncFn('@contentlayer/core/getConfig:getConfig', ['configPath', 'cwd']))

const getConfig_ = ({
  configPath,
  cwd,
  watch,
}: {
  configPath?: string
  cwd: string
  watch: boolean
}): Observable<SourcePlugin> => {
  return forkJoin({
    _esbuild: ensureEsbuildBin(),
    configPath: resolveConfigPath({ configPath, cwd }),
  }).pipe(
    mergeMap(({ configPath }) => makeTmpDirAndResolveEntryPoint({ configPath, cwd })),
    mergeMap(({ outfilePath, configPath }) =>
      callEsbuild({ entryPointPath: configPath, outfilePath, watch }).pipe(
        mergeMap((result) => getConfigFromResult({ result, configPath, outfilePath })),
      ),
    ),
  )
}

const callEsbuild = ({
  outfilePath,
  entryPointPath,
  watch,
}: {
  outfilePath: string
  entryPointPath: string
  watch: boolean
}): Observable<esbuild.BuildResult> => {
  return new Observable((subscriber) => {
    let result: esbuild.BuildResult | undefined

    esbuild
      .build({
        entryPoints: [entryPointPath],
        outfile: outfilePath,
        sourcemap: true,
        platform: 'node',
        // plugins: [dirnameOverrideEsbuildPlugin()],
        external: [
          'esbuild',
          // TODO make dynamic
          // needed for source-sanity
          '@sanity/core/lib/actions/graphql/getSanitySchema',

          // contentlayer
          // 'contentlayer/*',
          // '@contentlayer/*',

          // needed to make chokidar work on OSX (in source-local)
          'fsevents',

          // needed for shiki
          'onigasm',
          'shiki',
        ],
        target: 'es6',
        format: 'cjs',
        // needed in case models are colocated with React components
        jsx: 'transform',
        bundle: true,
        logLevel: 'error',
        plugins: [contentlayerGenPlugin()],
        watch: watch
          ? {
              onRebuild: (error, result) => {
                if (error) {
                  subscriber.error(error)
                } else {
                  subscriber.next(result!)
                }
              },
            }
          : false,
      })
      .then((result_) => {
        result = result_
        subscriber.next(result)
        if (!watch) {
          subscriber.complete()
        }
      })
      .catch((error) => subscriber.error(error))

    return () => {
      result?.stop?.()
    }
  })
}

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
    // wrapping in try/catch is needed to surpress esbuild warning
    try {
      const esbuildPackageJson = require(esbuildPackageJsonPath!)
      const binPath = path.join(esbuildPackagePath, esbuildPackageJson['bin']['esbuild'])
      process.env['ESBUILD_BINARY_PATH'] = binPath
    } catch (_) {}
  }
}

const resolveConfigPath = async ({ configPath, cwd }: { configPath?: string; cwd: string }): Promise<string> => {
  if (configPath) {
    if (path.isAbsolute(configPath)) {
      return configPath
    }

    return path.join(cwd, configPath)
  }

  const defaultFilePaths = [path.join(cwd, 'contentlayer.config.ts'), path.join(cwd, 'contentlayer.config.js')]
  const foundDefaultFiles = await promiseMap(defaultFilePaths, fileOrDirExists)
  const foundDefaultFile = defaultFilePaths[foundDefaultFiles.findIndex((_) => _)]
  if (foundDefaultFile) {
    return foundDefaultFile
  }

  throw new Error(`Could not find contentlayer.config.ts or contentlayer.config.js in ${cwd}`)
}

const makeTmpDirAndResolveEntryPoint = async ({ cwd, configPath }: { cwd: string; configPath: string }) => {
  const packageJsonPath = await pkgUp({ cwd })
  const packageDir = path.join(packageJsonPath!, '..')
  // `tmpDir` needs to be in package directory for `require` statements to work
  const tmpDir = path.join(packageDir, 'node_modules', '.tmp', 'contentlayer', 'config')
  await fs.mkdir(tmpDir, { recursive: true })
  const outfilePath = path.join(tmpDir, 'config.js')

  return { outfilePath, tmpDir, configPath }
}

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
