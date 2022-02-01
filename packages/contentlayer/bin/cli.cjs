#!/usr/bin/env node

const main = async () => {
  await import('../dist/cli/bundle.js')
}

main().catch((e) => console.log(e))
