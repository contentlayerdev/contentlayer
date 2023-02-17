import type { HasCwd } from '@contentlayer/core'
import * as core from '@contentlayer/core'
import { fs } from '@contentlayer/utils'
import type { HasClock, HasConsole, OT } from '@contentlayer/utils/effect'
import { pipe, T } from '@contentlayer/utils/effect'
import { Command, Option } from 'clipanion'
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

  abstract executeSafe: () => T.Effect<OT.HasTracer & HasClock & HasCwd & HasConsole & fs.HasFs, unknown, void>

  execute = (): Promise<void> =>
    pipe(
      this.executeSafe(),
      core.runMain({
        tracingServiceName: 'contentlayer-cli',
        verbose: this.verbose || process.env.CL_DEBUG !== undefined,
      }),
    )

  clearCacheIfNeeded = () => {
    const { clearCache } = this

    return T.gen(function* ($) {
      if (clearCache) {
        const cwd = yield* $(core.getCwd)
        const artifactsDir = core.ArtifactsDir.getDirPath({ cwd })
        yield* $(fs.rm(artifactsDir, { recursive: true, force: true }))
        yield* $(T.log('Cache cleared successfully'))
      }
    })
  }
}
