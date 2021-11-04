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
      pipe(clearCacheIfNeeded(this.clearCache), T.zipRight(this.executeSafe)),
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
