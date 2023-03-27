import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { OT } from '../effect/index.js'
import { pipe, T } from '../effect/index.js'
import { fs } from '../fs.js'

// TODO do this at compile time as this takes 10ms every time
// use static import once JSON modules are no longer experimental
// import utilsPkg from '@contentlayer/utils/package.json'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const getContentlayerVersion = (): T.Effect<OT.HasTracer & fs.HasFs, GetContentlayerVersionError, string> => {
  // Go two levels up for "dist/node/version.js"
  const packageJsonFilePath = path.join(__dirname, '..', '..', 'package.json')

  return pipe(
    fs.readFileJson(packageJsonFilePath),
    T.map((pkg: any) => pkg.version as string),
    T.catchTag('fs.FileNotFoundError', (e) => T.die(e)),
  )
}

export type GetContentlayerVersionError = fs.ReadFileError | fs.JsonParseError
