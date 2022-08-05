import type { AbsolutePosixFilePath, RelativePosixFilePath } from '@contentlayer/utils'
import { filePathJoin } from '@contentlayer/utils'
import type { OT } from '@contentlayer/utils/effect'
import { pipe, T } from '@contentlayer/utils/effect'
import type { GetContentlayerVersionError } from '@contentlayer/utils/node'
import { fs, getContentlayerVersion } from '@contentlayer/utils/node'

import type { HasCwd } from './cwd.js'
import { getCwd } from './cwd.js'
// import utilsPkg from '@contentlayer/utils/package.json'

export namespace ArtifactsDir {
  export const getDirPath = ({ cwd }: { cwd: AbsolutePosixFilePath }): AbsolutePosixFilePath =>
    filePathJoin(cwd, '.contentlayer' as AbsolutePosixFilePath)

  export const mkdir: T.Effect<OT.HasTracer & HasCwd, fs.MkdirError, AbsolutePosixFilePath> = T.gen(function* ($) {
    const cwd = yield* $(getCwd)
    const dirPath = getDirPath({ cwd })

    yield* $(fs.mkdirp(dirPath))

    return dirPath
  })

  export const getCacheDirPath: T.Effect<OT.HasTracer & HasCwd, GetContentlayerVersionError, AbsolutePosixFilePath> =
    pipe(
      T.struct({
        contentlayerVersion: getContentlayerVersion(),
        cwd: getCwd,
      }),
      T.map(({ contentlayerVersion, cwd }) =>
        filePathJoin(
          getDirPath({ cwd }),
          '.cache' as RelativePosixFilePath,
          `v${contentlayerVersion}` as RelativePosixFilePath,
        ),
      ),
    )

  export const mkdirCache: T.Effect<
    OT.HasTracer & HasCwd,
    fs.MkdirError | GetContentlayerVersionError,
    AbsolutePosixFilePath
  > = pipe(getCacheDirPath, T.tap(fs.mkdirp))
}
