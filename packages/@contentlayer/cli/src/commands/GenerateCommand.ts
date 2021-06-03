import { generateTypes, getConfig } from '@contentlayer/core'

import { BaseCommand } from './_BaseCommand'

export class GenerateCommand extends BaseCommand {
  static paths = [['generate']]

  async executeSafe() {
    const source = await getConfig({ configPath: this.configPath, cwd: process.cwd() })
    await generateTypes({ source, generateSchemaJson: true })
  }
}
