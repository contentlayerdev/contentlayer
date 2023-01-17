import * as core from '@contentlayer/core'
import * as SourceFiles from '@contentlayer/source-files'
import { unknownToAbsolutePosixFilePath } from '@contentlayer/utils'
import { M, OT, pipe, S, T } from '@contentlayer/utils/effect'

type CancelFn = () => void

type Args = SourceFiles.Args & {
  syncFiles: (
    /** Provided `contentDirPath` (as absolute file path) */
    contentDirPath: string,
  ) => Promise<CancelFn>
}

export const makeSource: core.MakeSourcePlugin<Args> = async (rawArgs) => {
  const {
    restArgs: { syncFiles, ...args },
  } = await core.processArgs(rawArgs)

  const sourcePlugin = await SourceFiles.makeSource(rawArgs)

  return {
    ...sourcePlugin,
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
          const cancelRemoteSyncing = yield* $(
            pipe(
              T.tryPromiseOrDie(() => syncFiles(contentDirPath)),
              OT.withSpan('syncFiles'),
            ),
          )

          yield* $(M.finalizer(T.sync(() => cancelRemoteSyncing())))

          return sourcePlugin.fetchData(fetchDataArgs)
        }),
        S.unwrapManaged,
      ),
  }
}
