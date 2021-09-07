import { getArtifactsDir } from '@contentlayer/core'
import { JaegerNodeTracing } from '@contentlayer/utils'
import { pipe } from '@effect-ts/core'
import * as T from '@effect-ts/core/Effect'
import { pretty } from '@effect-ts/core/Effect/Cause'
import type * as OT from '@effect-ts/otel'
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

  async execute() {
    try {
      if (this.clearCache) {
        await fs.rm(getArtifactsDir(), { recursive: true })
        console.log('Cache cleared successfully')
      }

      await pipe(
        this.executeSafe(),
        T.provideSomeLayer(JaegerNodeTracing('contentlayer-cli')),
        T.tapCause((cause) => T.die(pretty(cause))),
        T.runPromise,
      )
    } catch (e: any) {
      console.error(e)
    }
  }

  abstract executeSafe(): T.Effect<OT.HasTracer, unknown, void>
}
