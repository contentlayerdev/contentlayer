import { Builtins, Cli } from 'clipanion'

import { DefaultCommand } from './DefaultCommand.js'

export const run = async () => {
  const [node, app, ...args] = process.argv

  const cli = new Cli({
    binaryLabel: `My Application`,
    binaryName: `${node} ${app}`,
    binaryVersion: `1.0.1`,
  })

  cli.register(DefaultCommand)
  cli.register(Builtins.HelpCommand)
  cli.register(Builtins.VersionCommand)

  await cli.runExit(args, Cli.defaultContext)
}
