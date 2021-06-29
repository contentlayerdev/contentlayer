import { generateDotpkg, getConfig } from '@contentlayer/core'
import { traceAsync } from '@contentlayer/utils'
import { firstValueFrom } from 'rxjs'

import { BaseCommand } from './_BaseCommand'

export class BuildCommand extends BaseCommand {
  static paths = [['build']]

  async executeSafe() {
    const source = await getConfig({ configPath: this.configPath, cwd: process.cwd() })
    await traceAsync('', () =>  firstValueFrom(generateDotpkg({ source, watchData: false })))
  }
}
