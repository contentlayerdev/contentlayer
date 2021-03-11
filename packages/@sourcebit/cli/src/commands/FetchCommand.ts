import { Cache } from '@sourcebit/core'
import { Option } from 'clipanion'
import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import * as path from 'path'
import * as t from 'typanion'
import { getConfig } from '../lib/getConfig'
import { BaseCommand } from './_BaseCommand'

export class FetchCommand extends BaseCommand {
  static paths = [['fetch']]

  cachePath = Option.String('--cache', {
    required: false,
    validator: t.isString(),
  })

  watch = Option.Boolean('--watch,-w', {})

  async executeSafe() {
    const config = await getConfig({ configPath: this.configPath })
    const cacheFilePath = path.join(process.cwd(), this.cachePath ?? 'src/sourcebit.json')

    if (this.watch) {
      console.log(`Listening for content changes ...`)
    }

    const observable = await config.source.fetchData({ watch: this.watch })

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
}
