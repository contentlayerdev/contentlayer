import * as core from '@contentlayer/core'
import { errorToString } from '@contentlayer/utils'
import { E, OT, pipe, S, T } from '@contentlayer/utils/effect'
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
      OT.withStreamSpan('@contentlayer/cli/commands/DevCommand:stream'),
      S.runDrain,
      OT.withSpan('@contentlayer/cli/commands/DevCommand:executeSafe'),
    )
}
