import { getArtifactsDir } from '@contentlayer/core'
import { Command, Option } from 'clipanion'
import { promises as fs } from 'fs'
import * as t from 'typanion'

export abstract class BaseCommand extends Command {
  configPath = Option.String('-c,--config', 'contentlayer.config.ts', {
    description: 'Path to the config',
    validator: t.isString(),
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

      await this.executeSafe()
    } catch (e) {
      console.error(e)
    }
  }

  abstract executeSafe(): Promise<void>
}
