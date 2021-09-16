import type { OT } from '@contentlayer/utils/effect'
import { pipe, T } from '@contentlayer/utils/effect'
import { fs } from '@contentlayer/utils/node'
import * as crypto from 'crypto'
import * as path from 'path'

export const getArtifactsDir = (): string => path.join('node_modules', '.contentlayer')

// TODO make `cwd` configurable
export const makeArtifactsDir: T.Effect<OT.HasTracer, fs.MkdirError, string> = pipe(
  T.succeed(getArtifactsDir()),
  T.tap(fs.mkdirp),
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
