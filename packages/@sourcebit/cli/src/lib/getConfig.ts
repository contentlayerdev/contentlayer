import { Config } from '@sourcebit/core'
import { build as esbuild, Plugin } from 'esbuild'
import * as fs from 'fs/promises'
import * as path from 'path'
import pkgUp from 'pkg-up'

export async function getConfig({
  configPath,
  cwd = process.cwd(),
}: {
  configPath: string
  cwd?: string
}): Promise<Config> {
  // Fix esbuild binary path if not found (e.g. in local development setup)
  const esbuildBinPath = path.join(__dirname, '..', 'bin', 'esbuild')
  const esbuildBinExists = await fs
    .stat(esbuildBinPath)
    .then(() => true)
    .catch(() => false)
  if (!esbuildBinExists) {
    const esbuildPackageJsonPath = await pkgUp({ cwd: path.dirname(require.resolve('esbuild')) })
    const esbuildPackagePath = path.dirname(esbuildPackageJsonPath!)
    const esbuildPackageJson = require(esbuildPackageJsonPath!)
    const binPath = path.join(esbuildPackagePath, esbuildPackageJson['bin']['esbuild'])
    process.env['ESBUILD_BINARY_PATH'] = binPath
  }

  try {
    const packageJsonPath = await pkgUp({ cwd: process.cwd() })
    const tmpDir = path.join(packageJsonPath!, '..', 'node_modules', 'sourcebit', 'config')
    await fs.mkdir(tmpDir, { recursive: true })
    const outfilePath = path.join(tmpDir, 'sourcebit.js')
    const resolvedPath = path.join(cwd, configPath)
    const result = await esbuild({
      entryPoints: [resolvedPath],
      outfile: outfilePath,
      sourcemap: true,
      platform: 'node',
      plugins: [dirnameOverridePlugin()],
      // TODO make dynamic
      external: ['@sanity/core/lib/actions/graphql/getSanitySchema'],
      format: 'cjs',
      bundle: true,
    })
    if (result.warnings.length > 0) {
      console.error(result.warnings)
    }
    // const exports = await import(outfilePath)
    const exports = require(outfilePath)
    if (!('default' in exports)) {
      throw new Error(`Provided config path (${configPath}) doesn't have a default export.`)
    }

    return exports.default
  } catch (e) {
    console.error(e)
    throw e
  }
}

/** Needed to override the `__dirname` variable so relative linking still works */
const dirnameOverridePlugin = (): Plugin => ({
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
