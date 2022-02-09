import { OT, pipe, T } from '@contentlayer/utils/effect'
import { Command } from 'clipanion'

import { BaseCommand } from './_BaseCommand.js'

export class DefaultCommand extends BaseCommand {
  static paths = [Command.Default]

  executeSafe = () =>
    pipe(
      T.succeedWith(() => console.log(this.cli.usage())),
      OT.withSpan('@contentlayer/cli/commands/DefaultCommand:executeSafe', { attributes: { cwd: process.cwd() } }),
    )
}
