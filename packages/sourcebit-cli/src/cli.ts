import { Builtins, Cli } from 'clipanion'

import { FetchCommand } from './commands/FetchCommand'
import { GenerateCommand } from './commands/GenerateCommand'

const [node, app, ...args] = process.argv

const cli = new Cli({
  binaryLabel: `My Application`,
  binaryName: `${node} ${app}`,
  binaryVersion: `1.0.1`,
})

cli.register(FetchCommand)
cli.register(GenerateCommand)
cli.register(Builtins.HelpCommand)
cli.register(Builtins.VersionCommand)
cli.runExit(args, Cli.defaultContext)
