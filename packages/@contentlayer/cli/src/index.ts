import { Builtins, Cli } from 'clipanion'

import { BuildCommand } from './commands/BuildCommand'
import { DevCommand } from './commands/DevCommand'
import { FetchCommand } from './commands/FetchCommand'
import { GenerateCommand } from './commands/GenerateCommand'

const packageJson = require('../package.json')

export const run = () => {
  const [node, app, ...args] = process.argv

  const cli = new Cli({
    binaryLabel: `My Application`,
    binaryName: `${node} ${app}`,
    binaryVersion: packageJson.version,
  })

  // cli.register(FetchCommand)
  // cli.register(GenerateCommand)
  cli.register(DevCommand)
  cli.register(BuildCommand)
  cli.register(Builtins.HelpCommand)
  cli.register(Builtins.VersionCommand)
  cli.runExit(args, Cli.defaultContext)
}
