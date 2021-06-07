import { logPerformance } from '@contentlayer/utils'
import { Command, Option } from 'clipanion'
import * as t from 'typanion'

export abstract class BaseCommand extends Command {
  configPath = Option.String('-c,--config', 'contentlayer.config.ts', {
    description: 'Path to the config',
    validator: t.isString(),
  })

  async execute() {
    logPerformance()

    try {
      await this.executeSafe()
    } catch (e) {
      console.error(e)
    }
  }

  abstract executeSafe(): Promise<void>
}
