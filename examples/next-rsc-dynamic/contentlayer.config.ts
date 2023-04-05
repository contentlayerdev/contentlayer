import { defineDocumentType } from 'contentlayer/source-files'
import { spawn } from 'node:child_process'
import { makeSource } from 'contentlayer/source-remote-files'

const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `docs/**/*.md`,
  fields: {
    title: {
      type: 'string',
      required: false,
    },
    description: {
      type: 'string',
      required: false,
    },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (doc) => `${doc._raw.flattenedPath}`,
    },
  },
}))

const syncContentFromGit = async ({ contentDir, gitTag }: { contentDir: string; gitTag: string }) => {
  const startTime = Date.now()
  console.log(`Syncing content files from git (${gitTag}) to ${contentDir}`)

  const syncRun = async () => {
    const gitUrl = 'https://github.com/vercel/next.js.git'
    await runBashCommand(`
      #! /usr/bin/env bash

      sync_lock_file="${contentDir}/.sync.lock"

      function contentlayer_sync_run () {
        block_if_locked;

        mkdir -p ${contentDir};
        touch $sync_lock_file;

        if [ -d "${contentDir}/.git" ];
          then
            cd "${contentDir}";
            git fetch --quiet --depth=1 origin ${gitTag};
            git checkout --quiet FETCH_HEAD;
          else
            git init --quiet ${contentDir};
            cd ${contentDir};
            git remote add origin ${gitUrl};
            git config core.sparsecheckout true;
            git config advice.detachedHead false;
            echo "docs/*" >> .git/info/sparse-checkout;
            git checkout --quiet -b ${gitTag};
            git fetch --quiet --depth=1 origin ${gitTag};
            git checkout --quiet FETCH_HEAD;
        fi

        rm $sync_lock_file;
      }

      function block_if_locked () {
        if [ -f "$sync_lock_file" ];
          then
            while [ -f "$sync_lock_file" ]; do sleep 1; done;
            exit 0;
        fi
      }

      contentlayer_sync_run
    `)
  }

  let wasCancelled = false
  let syncInterval

  const syncLoop = async () => {
    await syncRun()

    if (wasCancelled) return

    syncInterval = setTimeout(syncLoop, 1000 * 60) // sync every minute
  }

  // Block until the first sync is done
  await syncLoop()

  const initialSyncDuration = ((Date.now() - startTime) / 1000).toPrecision(2)
  console.log(`Initial sync of content files from git took ${initialSyncDuration}s (still syncing every minute...)`)

  return () => {
    wasCancelled = true
    clearTimeout(syncInterval)
  }
}

const runBashCommand = (command: string) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, [], { shell: 'bash' })

    const logMessages: string[] = []

    child.stdout.setEncoding('utf8')
    child.stdout.on('data', (data) => {
      logMessages.push(data)
      process.stdout.write(data)
    })

    child.stderr.setEncoding('utf8')
    child.stderr.on('data', (data) => {
      logMessages.push(data)
      process.stderr.write(data)
    })

    child.on('close', function (code) {
      if (code === 0) {
        resolve(void 0)
      } else {
        const logStr = logMessages.join('\n')
        reject(new Error(`Command failed with exit code ${code}:\n\n${logStr}`))
      }
    })
  })

export default makeSource((sourceKey = 'canary') => ({
  syncFiles: (contentDir) => syncContentFromGit({ contentDir, gitTag: sourceKey }),
  contentDirPath: `content/nextjs-repo-${sourceKey}`,
  contentDirInclude: ['docs'],
  documentTypes: [Post],
  disableImportAliasWarning: true,
  experimental: { enableDynamicBuild: true },
}))
