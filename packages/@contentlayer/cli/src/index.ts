import '@contentlayer/tracing-node'

import { Builtins, Cli } from 'clipanion'

import { BuildCommand } from './commands/BuildCommand'
import { DevCommand } from './commands/DevCommand'
import { FetchCommand } from './commands/FetchCommand'
import { GenerateCommand } from './commands/GenerateCommand'

const packageJson = require('../package.json')

export const run = async () => {
  const [node, app, ...args] = process.argv

  const cli = new Cli({
    binaryLabel: `Contentlayer CLI`,
    binaryName: `${node} ${app}`,
    binaryVersion: packageJson.version,
  })

  // cli.register(FetchCommand)
  // cli.register(GenerateCommand)
  cli.register(DevCommand)
  cli.register(BuildCommand)
  cli.register(Builtins.HelpCommand)
  cli.register(Builtins.VersionCommand)

  // Run the CLI
  await cli.runExit(args, Cli.defaultContext)
}
