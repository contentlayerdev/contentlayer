import { Command, Option } from 'clipanion'
import * as t from 'typanion'

export abstract class BaseCommand extends Command {
  configPath = Option.String('-c,--config', {
    required: true,
    description: 'Path to the config',
    validator: t.isString(),
  })

  async execute() {
    try {
      await this.executeSafe()
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  abstract executeSafe(): Promise<void>
}
