#! /usr/local/bin/node

// @ts-check

const chokidar = require('chokidar')
const { createServer } = require('http')
const next = require('next')
const { generateTypes } = require('sourcebit/core')
const { parse } = require('url')
const sourcebitConfig = require('./sourcebit/sourcebit').default

const app = next({ dev: true, dir: process.cwd() })
const port = parseInt(process.env.PORT, 10) || 3000
const handle = app.getRequestHandler()
const watchDir = process.argv[2]

if (!watchDir) {
  throw new Error(`Please provide a directory path to watch as CLI argument.`)
}

app.prepare().then(async () => {
  console.log({ generateTypes })
  chokidar.watch(watchDir).on('change', async () => {
    app.server.hotReloader.send({
      event: 'serverOnlyChanges',
      pages: app.server.sortedRoutes,
    })

    await generateTypes({
      config: sourcebitConfig,
    })
  })

  await generateTypes({
    config: sourcebitConfig,
  })

  console.log(`Watching ${watchDir} for changes...`)

  createServer((req, res) => {
    handle(req, res, parse(req.url, true))
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
