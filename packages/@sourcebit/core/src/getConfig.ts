import { Config } from '@sourcebit/core'
import { build as esbuild, BuildResult, Plugin } from 'esbuild'
import * as fs from 'fs/promises'
import * as path from 'path'
import pkgUp from 'pkg-up'
import { Observable, of } from 'rxjs'
import { finalize, mergeMap } from 'rxjs/operators'

export const getConfigWatch = ({ configPath, cwd }: { configPath: string; cwd: string }): Observable<Config> => {
  return getConfig_({ configPath, cwd, watch: true })
}

export const getConfig = async ({ configPath, cwd }: { configPath: string; cwd: string }): Promise<Config> => {
  return getConfig_({ configPath, cwd, watch: false }).toPromise()
}

const getConfig_ = ({
  configPath,
  cwd,
  watch,
}: {
  configPath: string
  cwd: string
  watch: boolean
}): Observable<Config> => {
  return of(0).pipe(
    mergeMap(ensureEsbuildBin),
    mergeMap(() => makeTmpDirAndResolveEntryPoint({ configPath, cwd })),
    mergeMap(({ entryPointPath, outfilePath, tmpDir }) =>
      callEsbuild({ entryPointPath, outfilePath, watch }).pipe(
        mergeMap((result) => getConfigFromResult({ result, configPath, outfilePath })),
        finalize(() => fs.rmdir(tmpDir, { recursive: true })),
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
}): Observable<BuildResult> => {
  return new Observable((subscriber) => {
    let result: BuildResult | undefined

    esbuild({
      entryPoints: [entryPointPath],
      outfile: outfilePath,
      sourcemap: true,
      platform: 'node',
      plugins: [dirnameOverrideEsbuildPlugin()],
      // TODO make dynamic
      external: ['@sanity/core/lib/actions/graphql/getSanitySchema', 'esbuild'],
      format: 'cjs',
      bundle: true,
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

const makeTmpDirAndResolveEntryPoint = async ({ cwd, configPath }: { cwd: string; configPath: string }) => {
  const packageJsonPath = await pkgUp({ cwd })
  const packageDir = path.join(packageJsonPath!, '..')
  // `tmpDir` needs to be in package directory for `require` statements to work
  const tmpDir = path.join(packageDir, 'node_modules', '.sourcebit', 'config')
  await fs.mkdir(tmpDir, { recursive: true })
  const outfilePath = path.join(tmpDir, 'config.js')
  const entryPointPath = path.join(cwd, configPath)

  return { outfilePath, entryPointPath, tmpDir }
}

const getConfigFromResult = async ({
  result,
  configPath,
  outfilePath,
}: {
  result: BuildResult
  configPath: string
  outfilePath: string
}): Promise<Config> => {
  if (result.warnings.length > 0) {
    console.error(result.warnings)
  }

  // wrapping in try/catch is needed to surpress esbuild warning
  try {
    // TODO
    delete require.cache[require.resolve(outfilePath)]

    const exports = require(outfilePath)
    if (!('default' in exports)) {
      throw new Error(`Provided config path (${configPath}) doesn't have a default export.`)
    }

    return exports.default
  } catch (error) {
    console.error(error)
    throw error
  }
}

/** Needed to override the `__dirname` variable so relative linking still works */
const dirnameOverrideEsbuildPlugin = (): Plugin => ({
  name: 'dirname_override',
  setup(build) {
    // TODO need to come up with a better `filter`
    build.onLoad({ filter: /\/sourcebit\/.*/, namespace: 'file' }, async (args) => {
      // NOTE needed to deal with TypeScript sources as esbuild plugins don't seem to be composable right now
      const result = await esbuild({
        entryPoints: [args.path],
        write: false,
      })
      const contents = `var __dirname = "${path.dirname(args.path)}";\n${result.outputFiles![0].text}`
      return { contents }
    })
  },
})
