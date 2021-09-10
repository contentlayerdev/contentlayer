import { generateDotpkg, getConfig } from '@contentlayer/core'
import { OT, pipe, T } from '@contentlayer/utils/effect'

import { BaseCommand } from './_BaseCommand'

export class BuildCommand extends BaseCommand {
  static paths = [['build']]

  executeSafe = pipe(
    T.suspend(() => getConfig({ configPath: this.configPath, cwd: process.cwd() })),
    T.chain((source) => generateDotpkg({ source })),
    T.tap(() => T.succeedWith(() => console.log(`Generated node_modules/.contentlayer`))),
    OT.withSpan('@contentlayer/cli/commands/BuildCommand:executeSafe', { attributes: { cwd: process.cwd() } }),
  )
}
