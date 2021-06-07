import { generateDotpkg, getConfig } from '@contentlayer/core'
import { firstValueFrom } from 'rxjs'

import { BaseCommand } from './_BaseCommand'

export class BuildCommand extends BaseCommand {
  static paths = [['build']]

  async executeSafe() {
    const source = await getConfig({ configPath: this.configPath, cwd: process.cwd() })
    await firstValueFrom(generateDotpkg({ source, watchData: false }))
  }
}
