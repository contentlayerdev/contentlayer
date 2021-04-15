#!/usr/bin/env node

import { Builtins, Cli } from 'clipanion'
import { GenerateCommand } from './GenerateCommand'

export const run = () => {
  const [node, app, ...args] = process.argv

  const cli = new Cli({
    binaryLabel: `My Application`,
    binaryName: `${node} ${app}`,
    binaryVersion: `1.0.1`,
  })

  cli.register(GenerateCommand)
  cli.register(Builtins.HelpCommand)
  cli.register(Builtins.VersionCommand)
  cli.runExit(args, Cli.defaultContext)
}

run()
