import * as core from '@contentlayer/core'
import { JaegerNodeTracing } from '@contentlayer/utils'
import type { HasClock, OT } from '@contentlayer/utils/effect'
import { Cause, pipe, pretty, T } from '@contentlayer/utils/effect'
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

  execute = () => T.runPromise(runMain(this))
}

const runMain = (self: BaseCommand): T.Effect<T.DefaultEnv, never, void> =>
  T.gen(function* ($) {
    if (self.clearCache) {
      yield* $(T.promise(() => fs.rm(core.ArtifactsDir.getDirPath({ cwd: process.cwd() }), { recursive: true })))
      yield* $(T.log('Cache cleared successfully'))
    }

    const result = yield* $(pipe(self.executeSafe, T.provideSomeLayer(JaegerNodeTracing('contentlayer-cli')), T.result))

    if (result._tag === 'Failure') {
      const failOrCause = Cause.failureOrCause(result.cause)

      // If failure was a managed error and no `--verbose` flag was provided, print the error message
      if (failOrCause._tag === 'Left' && !self.verbose) {
        yield* $(T.log(failOrCause.left))
      }
      // otherwise for unmanaged errors or with `--verbose` flag provided, print the entire stack trace
      else {
        yield* $(T.log(pretty(result.cause)))
      }

      yield* $(T.succeedWith(() => process.exit(1)))
    }
  })
