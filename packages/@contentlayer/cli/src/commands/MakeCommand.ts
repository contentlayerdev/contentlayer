import { generateDotpkg, getConfig } from '@contentlayer/core'
import { firstValueFrom } from 'rxjs'

import { BaseCommand } from './_BaseCommand'

export class MakeCommand extends BaseCommand {
  static paths = [['make']]

  async executeSafe() {
    const source = await getConfig({ configPath: this.configPath, cwd: process.cwd() })
    await firstValueFrom(generateDotpkg({ source, watchData: false }))
  }
}
