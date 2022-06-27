#!/usr/bin/env node

const main = async () => {
  const { run } = await import('../dist/cli/index.js')
  await run()
}

main().catch((e) => console.log(e))
