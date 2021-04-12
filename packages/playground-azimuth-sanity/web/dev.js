// @ts-check

const { spawn } = require('child_process')
const { createServer } = require('http')
const next = require('next')
const { parse } = require('url')

const app = next({ dev: true, dir: process.cwd() })
const port = parseInt(process.env.PORT, 10) || 3000
const handle = app.getRequestHandler()
const configPath = process.argv[2]

if (!configPath) {
  throw new Error(`Please provide a directory path to watch as CLI argument.`)
}

const sanityScript = /* js */ `\
const { watch } = require('sourcebit/core')

watch({
  configPath: '${configPath}',
  onContentChange: () => process.send('change'),
})
`

app.prepare().then(async () => {
  runAsChildProcess(sanityScript, (msg) => {
    if (msg === 'change') {
      app.server.hotReloader.send({
        event: 'serverOnlyChanges',
        pages: app.server.sortedRoutes,
      })
    }
  })

  createServer((req, res) => {
    handle(req, res, parse(req.url, true))
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})

function runAsChildProcess(childProcessCode, onMessage) {
  spawn('node', ['-e', childProcessCode], { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] }).on('message', (msg) => {
    onMessage(msg.toString())
  })
}
