#! /usr/local/bin/node

// @ts-check

const { createServer } = require('http')
const next = require('next')
const { watch } = require('sourcebit/core')
const { parse } = require('url')

console.log({ URL })

const app = next({ dev: true, dir: process.cwd() })
const port = parseInt(process.env.PORT, 10) || 3000
const handle = app.getRequestHandler()
const configPath = process.argv[2]

if (!configPath) {
  throw new Error(`Please provide a directory path to watch as CLI argument.`)
}

app.prepare().then(async () => {
  watch({
    configPath,
    onContentChange: () => {
      console.log('change detected')
      app.server.hotReloader.send({
        event: 'serverOnlyChanges',
        pages: app.server.sortedRoutes,
      })
    },
  })

  console.log(`Watching ${configPath} for changes...`)

  createServer((req, res) => {
    handle(req, res, parse(req.url, true))
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
