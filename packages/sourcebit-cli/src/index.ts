#!/usr/bin/env node

import arg from 'arg'
import generateCommand from './commands/GenerateCommand'

const commands: Record<string, () => Promise<void>> = {
  generate: generateCommand,
}

function help() {}

async function main() {
  const args = arg({}, { permissive: true, argv: process.argv.slice(2) })
  if (args._.length === 0) {
    help()
    return
  }

  const parsedCommand = args._[0]
  if (!Object.keys(commands).includes(parsedCommand)) {
    console.log(`Not a valid command: ${parsedCommand}`)
    help()
    return
  }

  const command = commands[parsedCommand]
  await command()
}

main().catch((e) => console.error(e))
