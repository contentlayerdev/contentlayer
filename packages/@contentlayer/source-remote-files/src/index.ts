import * as core from '@contentlayer/core'
import type { Args as SourceFilesArgs } from '@contentlayer/source-files'
import { makeSource as makeSourceFromSourceFiles } from '@contentlayer/source-files'
import { unknownToAbsolutePosixFilePath } from '@contentlayer/utils'
import { M, OT, pipe, S, T } from '@contentlayer/utils/effect'

type CancelFn = () => void

type Args = SourceFilesArgs & {
  syncFiles: (
    /** Provided `contentDirPath` (as absolute file path) */
    contentDirPath: string,
  ) => Promise<CancelFn>
  experimental?: {
    enableDynamicBuild?: boolean
  }
}

export const makeSource: core.MakeSourcePlugin<Args> = (rawArgs) => async (sourceKey) => {
  const {
    restArgs: { syncFiles, ...args },
  } = await core.processArgs(rawArgs, sourceKey)

  const sourcePlugin = await makeSourceFromSourceFiles(rawArgs)(sourceKey)

  return {
    ...sourcePlugin,
    type: 'remote-files',
    fetchData: (fetchDataArgs) =>
      pipe(
        M.gen(function* ($) {
          const contentDirPath = yield* $(
            pipe(
              core.getCwd,
              T.map((cwd) => unknownToAbsolutePosixFilePath(args.contentDirPath, cwd)),
            ),
          )

          // TODO acutally cancel the syncing when the process is terminated
          const syncFilesResult = yield* $(
            pipe(
              T.tryPromise(() => syncFiles(contentDirPath)),
              T.mapError((error) => new core.SourceFetchDataError({ error, alreadyHandled: false })),
              T.either,
              OT.withSpan('syncFiles'),
            ),
          )

          if (syncFilesResult._tag === 'Left') {
            return S.fromValue(syncFilesResult)
          }

          const cancelRemoteSyncing = syncFilesResult.right

          yield* $(M.finalizer(T.sync(() => cancelRemoteSyncing())))

          return sourcePlugin.fetchData(fetchDataArgs)
        }),
        S.unwrapManaged,
      ),
    //   ),
    // ),
  }
}
