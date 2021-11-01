import * as core from '@contentlayer/core'
import { errorToString, JaegerNodeTracing } from '@contentlayer/utils'
import type { HasClock, OT } from '@contentlayer/utils/effect'
import { Cause, Ex, pipe, T } from '@contentlayer/utils/effect'
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

  async execute() {
    const result = await pipe(
      T.when(() => this.clearCache)(
        pipe(
          T.tryPromise(() => fs.rm(core.ArtifactsDir.getDirPath({ cwd: process.cwd() }), { recursive: true })),
          T.tap(() => T.succeedWith(() => console.log('Cache cleared successfully'))),
        ),
      ),
      T.chain(() => this.executeSafe),
      T.provideSomeLayer(JaegerNodeTracing('contentlayer-cli')),
      (effect) => (this.verbose ? T.catchAllCause_(effect, T.fail) : effect),
      T.catchAll((e) => {
        if (Cause.isCause(e)) {
          return T.die(console.log(errorToString(Cause.pretty(e))))
        }
        return T.die(console.log(errorToString(e)))
      }),
      T.runPromiseExit,
    )

    Ex.getOrElse_(result, () => {
      process.exit(1)
    })
  }

  abstract executeSafe: T.Effect<OT.HasTracer & HasClock, unknown, void>
}
