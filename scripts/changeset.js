#!/usr/bin/env node
'use strict'
const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const [command, ...flags] = process.argv.slice(2)

if (command) {
  const changesetResult = spawnSync(
    process.argv[0],
    [path.join(__dirname, '..', 'node_modules', '.bin', 'changeset'), command, ...flags],
    { stdio: 'inherit' },
  )

  if (changesetResult.status !== 0) {
    process.exit(changesetResult.status)
  }

  if (command === 'version') {
    const untrackedFilesResult = spawnSync('git', ['ls-files', '--others', '--exclude-standard'])

    if (untrackedFilesResult.status !== 0) {
      process.exit(untrackedFilesResult.status)
    }

    const untrackedFiles = untrackedFilesResult.stdout.toString().trim().split('\n')

    for (const file of untrackedFiles) {
      const filePath = path.join(__dirname, '..', file)
      if (!filePath.endsWith('/CHANGELOG.md')) {
        continue
      }
      if (filePath.endsWith('/@contentlayer/core/CHANGELOG.md')) {
        const changelog = fs.readFileSync(filePath, 'utf8')
        const versionHeader = /^## \d+\.\d+\.\d+/gm

        // we leverage statefulness of `g` regex here for the second `exec` to start of the `lastIndex` from the first match
        const start = versionHeader.exec(changelog).index
        // can't use optional chaining for now because GitHub Actions run on node12, see https://github.com/actions/github-script/pull/182#issuecomment-903966153
        const endExecResult = versionHeader.exec(changelog)
        const end = endExecResult ? endExecResult.index : changelog.length

        const latestChangelogEntry = changelog.slice(start, end)
        const [match, version] = latestChangelogEntry.match(/## (.+)\s*$/m)

        const content = latestChangelogEntry.slice(match.length).trim()

        if (content) {
          const rootChangelogPath = path.join(__dirname, '..', 'CHANGELOG.md')
          const rootChangelog = fs.readFileSync(rootChangelogPath, 'utf8')

          fs.writeFileSync(rootChangelogPath, rootChangelog.replace('\n', `\n\n## ${version}\n\n${content}\n`))
        }
      }
      fs.unlinkSync(filePath)
    }
  }
} else {
  const changesetName = new Date()
    .toISOString()
    .replace(/\.\d{3}Z$/, '')
    .replace(/[^\d]/g, '')
    .toString()

  fs.writeFileSync(
    path.join(__dirname, '..', '.changeset', `${changesetName}.md`),
    `---\n'@contentlayer/core': patch\n---\n`,
  )
}
