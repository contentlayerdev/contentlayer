import type { AbsolutePosixFilePath, RelativePosixFilePath } from '@contentlayer-temp/utils'
import { filePathJoin, fs } from '@contentlayer-temp/utils'
import type { OT } from '@contentlayer-temp/utils/effect'
import { pipe, T } from '@contentlayer-temp/utils/effect'
import type { GetContentlayerVersionError } from '@contentlayer-temp/utils/node'
import { getContentlayerVersion } from '@contentlayer-temp/utils/node'

import type { HasCwd } from './cwd.js'
import { getCwd } from './cwd.js'
// import utilsPkg from '@contentlayer-temp/utils/package.json'

export const getDirPath = ({ cwd }: { cwd: AbsolutePosixFilePath }): AbsolutePosixFilePath =>
  filePathJoin(cwd, '.contentlayer' as AbsolutePosixFilePath)

export const mkdir: T.Effect<OT.HasTracer & HasCwd & fs.HasFs, fs.MkdirError, AbsolutePosixFilePath> = T.gen(function* (
  $,
) {
  const cwd = yield* $(getCwd)
  const dirPath = getDirPath({ cwd })

  yield* $(fs.mkdirp(dirPath))

  return dirPath
})

export const getCacheDirPath: T.Effect<
  OT.HasTracer & HasCwd & fs.HasFs,
  GetContentlayerVersionError,
  AbsolutePosixFilePath
> = pipe(
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
  OT.HasTracer & HasCwd & fs.HasFs,
  fs.MkdirError | GetContentlayerVersionError,
  AbsolutePosixFilePath
> = pipe(
  getCacheDirPath,
  T.tap((_) => fs.mkdirp(_)),
)
