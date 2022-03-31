import * as core from '@contentlayer/core'
import { OT, pipe, T } from '@contentlayer/utils/effect'
import type { Usage } from 'clipanion'

import { BaseCommand } from './_BaseCommand.js'

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

  executeSafe = () =>
    pipe(
      this.clearCacheIfNeeded(),
      T.chain(() => core.getConfig({ configPath: this.configPath })),
      T.tap((config) => (config.source.options.disableImportAliasWarning ? T.unit : T.fork(core.validateTsconfig))),
      T.chain((config) => core.generateDotpkg({ config, verbose: this.verbose })),
      T.tap(core.logGenerateInfo),
      OT.withSpan('@contentlayer/cli/commands/BuildCommand:executeSafe'),
    )
}
