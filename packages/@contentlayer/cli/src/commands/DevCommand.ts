import { generateDotpkgStream, getConfigWatch } from '@contentlayer/core'
import { E, pipe, S, T } from '@contentlayer/utils/effect'

import { BaseCommand } from './_BaseCommand'

export class DevCommand extends BaseCommand {
  static paths = [['dev']]

  executeSafe = pipe(
    S.suspend(() =>
      getConfigWatch({
        configPath: this.configPath,
        cwd: process.cwd(),
      }),
    ),
    S.tapSkipFirstRight(() => T.log(`Contentlayer config change detected. Updating type definitions and data...`)),
    S.chainSwitchMapEitherRight((source) => generateDotpkgStream({ source })),
    S.tap(
      E.fold(
        (error) => T.log(error.toString()),
        () => T.log(`Generated node_modules/.contentlayer`),
      ),
    ),
    S.runDrain,
  )
}
