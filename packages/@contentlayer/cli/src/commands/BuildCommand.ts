import { generateDotpkg, getConfig } from '@contentlayer/core'
import { traceAsyncFn } from '@contentlayer/utils'
import { firstValueFrom } from 'rxjs'

import { BaseCommand } from './_BaseCommand'

export class BuildCommand extends BaseCommand {
  static paths = [['build']]

  executeSafe = (async () => {
    const source = await getConfig({ configPath: this.configPath, cwd: process.cwd() })
    await firstValueFrom(generateDotpkg({ source, watchData: false }))
    console.log(`Generated node_modules/.contentlayer`)
  })['|>'](traceAsyncFn('@contentlayer/cli/commands/BuildCommand:executeSafe'))
}
