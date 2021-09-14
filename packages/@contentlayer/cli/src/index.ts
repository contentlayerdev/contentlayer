import '@contentlayer/utils/effect/Tracing/Enable'

import { Builtins, Cli } from 'clipanion'

import { BuildCommand } from './commands/BuildCommand'
import { DefaultCommand } from './commands/DefaultCommand'
import { DevCommand } from './commands/DevCommand'
import { PostInstallCommand } from './commands/PostInstallCommand'

const packageJson = require('../../package.json')

export const run = async () => {
  const [node, app, ...args] = process.argv

  const cli = new Cli({
    binaryLabel: `Contentlayer CLI`,
    binaryName: process.env['CL_DEBUG'] ? `${node} ${app}` : 'contentlayer',
    binaryVersion: packageJson.version,
  })

  cli.register(DefaultCommand)
  cli.register(DevCommand)
  cli.register(BuildCommand)
  cli.register(PostInstallCommand)
  cli.register(Builtins.HelpCommand)
  cli.register(Builtins.VersionCommand)

  // Run the CLI
  await cli.runExit(args, Cli.defaultContext)
}
