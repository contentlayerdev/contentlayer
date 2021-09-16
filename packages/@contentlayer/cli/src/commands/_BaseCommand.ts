import { getArtifactsDir } from '@contentlayer/core'
import { JaegerNodeTracing } from '@contentlayer/utils'
import type { Clock, Has, OT } from '@contentlayer/utils/effect'
import { pipe, pretty, T } from '@contentlayer/utils/effect'
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
    try {
      if (this.clearCache) {
        await fs.rm(getArtifactsDir(), { recursive: true })
        console.log('Cache cleared successfully')
      }

      await pipe(
        this.executeSafe,
        T.provideSomeLayer(JaegerNodeTracing('contentlayer-cli')),
        T.tapCause((cause) => (this.verbose ? T.die(pretty(cause)) : T.unit)),
        T.runPromise,
      )
    } catch (e: any) {
      if (e._tag !== 'HandledFetchDataError') {
        console.error(e.toString())
      }
      process.exit(1)
    }
  }

  abstract executeSafe: T.Effect<OT.HasTracer & Has<Clock.Clock>, unknown, void>
}
