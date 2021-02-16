import { SchemaDef } from '@sourcebit/sdk'
import { build } from 'esbuild'
import nodeEval from 'eval'
import * as path from 'path'

export async function getSchemaDef({
  schemaPath,
  cwd = process.cwd(),
}: {
  schemaPath: string
  cwd?: string
}): Promise<SchemaDef> {
  const resolvedPath = path.join(cwd, schemaPath)
  const result = await build({
    entryPoints: [resolvedPath],
    write: false,
    // outfile: 'out.js',
    platform: 'node',
    format: 'cjs',
    bundle: true,
  })
  if (result.warnings.length > 0) {
    console.error(result.warnings)
  }

  const exports = nodeEval(result.outputFiles![0].text, schemaPath)
  if (!('default' in exports)) {
    throw new Error(
      `Provided schema path (${schemaPath}) doesn't have a default export.`,
    )
  }

  return exports.default
}
