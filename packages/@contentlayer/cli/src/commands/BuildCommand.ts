import { generateDotpkg, getConfig } from '@contentlayer/core'
import { traceAsync, traceAsyncFn } from '@contentlayer/utils'
import { firstValueFrom } from 'rxjs'

import { BaseCommand } from './_BaseCommand'

export class BuildCommand extends BaseCommand {
  static paths = [['build']]

  executeSafe = traceAsyncFn('@contentlayer/cli/commands/BuildCommand:executeSafe')(async () => {
    const source = await getConfig({ configPath: this.configPath, cwd: process.cwd() })
    await traceAsync('', () => firstValueFrom(generateDotpkg({ source, watchData: false })))
  })
}
