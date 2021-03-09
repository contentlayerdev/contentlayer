import { Config } from '@sourcebit/core'
import { build } from 'esbuild'
import * as fs from 'fs/promises'
import * as os from 'os'
import * as path from 'path'

export async function getConfig({
  configPath,
  cwd = process.cwd(),
}: {
  configPath: string
  cwd?: string
}): Promise<Config> {
  try {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sourcebit-'))
    const outfilePath = path.join(tmpDir, 'sourcebit.js')
    const resolvedPath = path.join(cwd, configPath)
    const result = await build({
      entryPoints: [resolvedPath],
      outfile: outfilePath,
      sourcemap: true,
      platform: 'node',
      format: 'cjs',
      bundle: true,
    })
    if (result.warnings.length > 0) {
      console.error(result.warnings)
    }
    const exports = await import(outfilePath)
    if (!('default' in exports)) {
      throw new Error(`Provided config path (${configPath}) doesn't have a default export.`)
    }

    return exports.default
  } catch (e) {
    console.error(e)
    throw e
  }
}
