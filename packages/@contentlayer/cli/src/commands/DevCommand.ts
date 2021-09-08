import { generateDotpkgStream, getConfigWatch } from '@contentlayer/core'
import { effectUtils } from '@contentlayer/utils'
import { pipe } from '@effect-ts/core'
import * as S from '@effect-ts/core/Effect/Stream'

import { BaseCommand } from './_BaseCommand'

export class DevCommand extends BaseCommand {
  static paths = [['dev']]

  executeSafe = () =>
    pipe(
      getConfigWatch({
        configPath: this.configPath,
        cwd: process.cwd(),
      }),
      effectUtils.streamTapSkipFirst(() =>
        effectUtils.log(`Contentlayer config change detected. Updating type definitions and data...`),
      ),
      S.chainParSwitch(1, (source) => generateDotpkgStream({ source })),
      S.tap(() => effectUtils.log(`Generated node_modules/.contentlayer`)),
      S.runDrain,
    )
}
