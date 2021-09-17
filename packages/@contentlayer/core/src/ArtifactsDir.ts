import type { OT } from '@contentlayer/utils/effect'
import { pipe, T } from '@contentlayer/utils/effect'
import { fs } from '@contentlayer/utils/node'
import { version as contentlayerVersion } from '@contentlayer/utils/package.json'
import * as path from 'path'

export namespace ArtifactsDir {
  export const getDirPath = ({ cwd }: { cwd: string }): string => path.join(cwd, 'node_modules', '.contentlayer')

  export const mkdir = ({ cwd }: { cwd: string }): T.Effect<OT.HasTracer, fs.MkdirError, string> =>
    pipe(T.succeed(getDirPath({ cwd })), T.tap(fs.mkdirp))

  export const getCacheDirPath = ({ cwd }: { cwd: string }): string =>
    path.join(getDirPath({ cwd }), '.cache', `v-${contentlayerVersion}`)

  export const mkdirCache = ({ cwd }: { cwd: string }): T.Effect<OT.HasTracer, fs.MkdirError, string> =>
    pipe(T.succeed(getCacheDirPath({ cwd })), T.tap(fs.mkdirp))
}
