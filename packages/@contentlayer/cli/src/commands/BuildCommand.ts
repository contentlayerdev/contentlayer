import { generateDotpkg, getConfig } from '@contentlayer/core'
import { OT, pipe, T } from '@contentlayer/utils/effect'
import type { Usage } from 'clipanion'

import { BaseCommand } from './_BaseCommand'

export class BuildCommand extends BaseCommand {
  static paths = [['build']]

  static usage: Usage = {
    description: `Transforms your content into static data`,
    details: `
      TODO: Longer description 
    `,
    examples: [
      [`Simple run`, `$0 build`],
      [`Clear cache before run`, `$0 build --clearCache`],
    ],
  }

  executeSafe = pipe(
    T.suspend(() => getConfig({ configPath: this.configPath, cwd: process.cwd() })),
    T.chain((source) => generateDotpkg({ source })),
    T.tap(() => T.succeedWith(() => console.log(`Generated node_modules/.contentlayer`))),
    OT.withSpan('@contentlayer/cli/commands/BuildCommand:executeSafe', { attributes: { cwd: process.cwd() } }),
  )
}
