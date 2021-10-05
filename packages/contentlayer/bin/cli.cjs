#!/usr/bin/env node

const main = async () => {
  const { run } = await import('@contentlayer/cli')
  await run()
}

main().catch((e) => console.log(e))
