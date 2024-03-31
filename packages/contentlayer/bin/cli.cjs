#!/usr/bin/env node

const main = async () => {
  const { run } = await import('@contentlayer2/cli')
  await run()
}

main().catch((e) => console.log(e))
