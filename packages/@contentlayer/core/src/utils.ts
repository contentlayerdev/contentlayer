import type { MkdirError } from '@contentlayer/utils/node'
import { mkdirp } from '@contentlayer/utils/node'
import { pipe } from '@effect-ts/core'
import * as T from '@effect-ts/core/Effect'
import type * as OT from '@effect-ts/otel'
import * as crypto from 'crypto'
import { promises as fs } from 'fs'
import * as path from 'path'

// TODO make `cwd` configurable
export const makeArtifactsDir = async (): Promise<string> => {
  const artifactsDirPath = getArtifactsDir()
  await fs.mkdir(artifactsDirPath, { recursive: true })

  return artifactsDirPath
}

export const getArtifactsDir = (): string => path.join('node_modules', '.contentlayer')

// TODO make `cwd` configurable
export const makeArtifactsDirEff: T.Effect<OT.HasTracer, MkdirError, string> = pipe(
  T.succeed(getArtifactsDir()),
  T.tap(mkdirp),
)

// From https://gist.github.com/un33k/db8f0f804d50f671be7ca6663bef1969
export const hashObject = (object: any): string => {
  const hash = crypto
    .createHash('md5')
    .update(
      JSON.stringify(object, (k, v) => {
        if (k[0] === '_') return undefined
        // remove api stuff
        else if (typeof v === 'function')
          // consider functions
          return v.toString()
        else return v
      }),
    )
    .digest('hex')
  return hash
}
