import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import * as path from 'path'
import { Config } from '../config'
import { Cache } from '../data'
import { makeArtifactsDir } from '../utils'

export const fetchDataAndCache = async ({
  config,
  cachePath,
  watch,
}: {
  config: Config
  cachePath?: string
  watch?: boolean
}): Promise<void> => {
  let cacheFilePath: string
  if (cachePath) {
    cacheFilePath = path.join(cachePath, 'cache.json')
  } else {
    const artifactsDirPath = await makeArtifactsDir()
    cacheFilePath = path.join(artifactsDirPath, 'cache.json')
  }

  if (watch) {
    console.log(`Listening for content changes ...`)
  }

  const observable = await config.source.fetchData({ watch: watch })

  let lastHash: string | undefined
  observable.subscribe({
    next: async ({ documents }) => {
      const hash = createHash('sha1').update(JSON.stringify(documents)).digest('base64')
      if (hash !== lastHash) {
        const cache: Cache = { documents, hash }
        await fs.writeFile(cacheFilePath, JSON.stringify(cache, null, 2))
        console.log(`Data cache file successfully written to ${cacheFilePath}`)
        lastHash = hash
      }
    },
  })
}
