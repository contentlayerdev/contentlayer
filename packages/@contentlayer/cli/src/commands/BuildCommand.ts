import { generateDotpkg, getConfig } from '@contentlayer/core'
import { pipe } from '@effect-ts/core'
import * as T from '@effect-ts/core/Effect'
import * as OT from '@effect-ts/otel'

import { BaseCommand } from './_BaseCommand'

export class BuildCommand extends BaseCommand {
  static paths = [['build']]

  executeSafe = () =>
    pipe(
      getConfig({ configPath: this.configPath, cwd: process.cwd() }),
      T.chain((source) => generateDotpkg({ source })),
      T.tap(() => T.succeedWith(() => console.log(`Generated node_modules/.contentlayer`))),
      OT.withSpan('@contentlayer/cli/commands/BuildCommand:executeSafe'),
    )
}
