import { generateDotpkgStream, getConfigWatch } from '@contentlayer/core'
import { E, pipe, S, T } from '@contentlayer/utils/effect'
import type { Usage } from 'clipanion'

import { BaseCommand } from './_BaseCommand'

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

  executeSafe = pipe(
    S.suspend(() =>
      getConfigWatch({
        configPath: this.configPath,
        cwd: process.cwd(),
      }),
    ),
    S.tapSkipFirstRight(() => T.log(`Contentlayer config change detected. Updating type definitions and data...`)),
    S.chainSwitchMapEitherRight((source) => generateDotpkgStream({ source, verbose: this.verbose })),
    S.tap(
      E.fold(
        (error) => T.log(error.toString()),
        () => T.log(`Generated node_modules/.contentlayer`),
      ),
    ),
    S.runDrain,
  )
}
