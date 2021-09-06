import { watch } from '@contentlayer/core'
import { Command, Option } from 'clipanion'
import { createServer } from 'http'
import next from 'next'
import * as t from 'typanion'
import { parse } from 'url'

export class DefaultCommand extends Command {
  configPath = Option.String('-c,--config', 'contentlayer.config.ts', {
    description: 'Path to the Contentlayer config',
    validator: t.isString(),
  })

  port = Option.String('-p,--port', '3000', {
    description: 'Next.js dev server port',
    validator: t.isNumber(),
  })

  hostname = Option.String('-H,--hostname', '0.0.0.0', {
    description: 'Next.js dev server hostname',
    validator: t.isString(),
  })

  async execute() {
    try {
      await this.executeSafe()
    } catch (e: any) {
      console.error(e)
      throw e
    }
  }

  async executeSafe() {
    await run({ configPath: this.configPath, port: this.port, hostname: this.hostname })
  }
}

const run = async ({ configPath, port, hostname }: { configPath: string; port: number; hostname: string }) => {
  const app = next({ dev: true, dir: process.cwd() })
  const handle = app.getRequestHandler()

  if (!configPath) {
    throw new Error(`Please provide a directory path to watch as CLI argument.`)
  }

  await app.prepare()
  // @ts-ignore
  const { server } = app
  watch({
    configPath,
    onContentChange: () => {
      server.hotReloader.send({
        event: 'serverOnlyChanges',
        pages: server.sortedRoutes,
      })
      console.log(`Next.js data refreshed.`)
    },
  })

  createServer((req, res) => handle(req, res, parse(req.url!, true)))
    // @ts-ignore
    .listen(port, hostname, (err: any) => {
      if (err) throw err
      console.log(`> Ready on http://${hostname}:${port}`)
    })
}
