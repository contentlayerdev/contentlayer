import { generateTypes, getConfig } from '@sourcebit/core'
import { BaseCommand } from './_BaseCommand'

export class GenerateCommand extends BaseCommand {
  static paths = [['generate']]

  async executeSafe() {
    const config = await getConfig({ configPath: this.configPath, cwd: process.cwd() })
    await generateTypes({ config, generateSchemaJson: true })
  }
}
