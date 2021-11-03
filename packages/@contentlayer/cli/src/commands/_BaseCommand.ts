import * as core from '@contentlayer/core'
import type { HasClock, OT } from '@contentlayer/utils/effect'
import { pipe, T } from '@contentlayer/utils/effect'
import { Command, Option } from 'clipanion'
import { promises as fs } from 'fs'
import * as t from 'typanion'

export abstract class BaseCommand extends Command {
  configPath = Option.String('-c,--config', {
    description: 'Path to the config (default: contentlayer.config.ts/js)',
    validator: t.isString(),
    required: false,
  })

  clearCache = Option.Boolean('--clearCache', false, {
    description: 'Whether to clear the cache before running the command',
  })

  verbose = Option.Boolean('--verbose', false, {
    description: 'More verbose logging and error stack traces',
  })

  abstract executeSafe: T.Effect<OT.HasTracer & HasClock, unknown, void>

  execute = () =>
    pipe(
      pipe(
        clearCacheIfNeeded(this.clearCache),
        T.chain(() => this.executeSafe),
      ),
      core.runMain({
        tracingServiceName: 'contentlayer-cli',
        verbose: this.verbose || process.env.CL_DEBUG !== undefined,
      }),
    )
}

const clearCacheIfNeeded = (shouldClearCache: boolean) =>
  T.gen(function* ($) {
    if (shouldClearCache) {
      yield* $(T.promise(() => fs.rm(core.ArtifactsDir.getDirPath({ cwd: process.cwd() }), { recursive: true })))
      yield* $(T.log('Cache cleared successfully'))
    }
  })

// const runMain = (self: BaseCommand): T.Effect<T.DefaultEnv, never, void> =>
//   T.gen(function* ($) {

//     if (process.platform === 'win32') {
//       yield* $(T.log('Warning: Contentlayer might not work as expected on Windows'))
//     }

//     const result = yield* $(pipe(self.executeSafe, T.provideSomeLayer(JaegerNodeTracing('contentlayer-cli')), T.result))

//     if (result._tag === 'Failure') {
//       const failOrCause = Cause.failureOrCause(result.cause)
//       const errorWasManaged = failOrCause._tag === 'Left'

//       if (!errorWasManaged) {
//         yield* $(
//           T.log(`\
// This error shouldn't have happened. Please consider opening a GitHub issue with the stack trace below here:
// https://github.com/contentlayerdev/contentlayer/issues`),
//         )
//       }

//       // If failure was a managed error and no `--verbose` flag was provided, print the error message
//       if (errorWasManaged && !self.verbose) {
//         if (!core.isSourceFetchDataError(failOrCause.left) || !failOrCause.left.alreadyHandled) {
//           yield* $(T.log(failOrCause.left))
//         }
//       }
//       // otherwise for unmanaged errors or with `--verbose` flag provided, print the entire stack trace
//       else {
//         yield* $(T.log(pretty(result.cause)))
//       }

//       yield* $(T.succeedWith(() => process.exit(1)))
//     }
//   })
