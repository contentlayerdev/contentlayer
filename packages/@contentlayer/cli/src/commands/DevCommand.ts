import * as core from '@contentlayer2/core'
import { errorToString } from '@contentlayer2/utils'
import { E, OT, pipe, S, T } from '@contentlayer2/utils/effect'
import type { Usage } from 'clipanion'

import { BaseCommand } from './_BaseCommand.js'

export class DevCommand extends BaseCommand {
  static paths = [['dev']]

  static usage: Usage = {
    description: `Same as "contentlayer build" but with watch mode`,
    details: `
      TODO: Longer description 
    `,
    examples: [
      [`Simple run`, `$0 dev`],
      [`Clear cache before run`, `$0 dev --clearCache`],
    ],
  }

  executeSafe = () =>
    pipe(
      S.fromEffect(this.clearCacheIfNeeded()),
      S.chain(() => core.getConfigWatch({ configPath: this.configPath })),
      S.tapSkipFirstRight(() => T.log(`Contentlayer config change detected. Updating type definitions and data...`)),
      S.tapRight((config) =>
        config.source.options.disableImportAliasWarning ? T.unit : T.fork(core.validateTsconfig),
      ),
      S.chainSwitchMapEitherRight((config) =>
        core.generateDotpkgStream({ config, verbose: this.verbose, isDev: true }),
      ),
      S.tap(E.fold((error) => T.log(errorToString(error)), core.logGenerateInfo)),
      OT.withStreamSpan('@contentlayer2/cli/commands/DevCommand:stream'),
      S.runDrain,
      OT.withSpan('@contentlayer2/cli/commands/DevCommand:executeSafe'),
    )
}
