import { Option } from 'clipanion'
import { promises as fs } from 'fs'
import * as path from 'path'
import * as t from 'typanion'
import { getConfig } from '../lib/getConfig'
import { BaseCommand } from './_BaseCommand'

export class FetchCommand extends BaseCommand {
  static paths = [['fetch']]

  // content = Option.String('--content,-c', {
  //   required: true,
  //   validator: t.isString(),
  // })

  cachePath = Option.String('--cache', {
    required: false,
    validator: t.isString(),
  })

  watch = Option.Boolean('--watch,-w', {})

  async executeSafe() {
    const config = await getConfig({ configPath: this.configPath })
    // const filePaths = await glob(this.content)

    // console.log(`Found ${filePaths.length} content files.`)

    // const cacheFilePath = path.join(process.cwd(), 'src/sourcebit.json')
    const cacheFilePath = path.join(process.cwd(), this.cachePath ?? 'src/sourcebit.json')

    if (this.watch) {
      console.log(`Listening for content changes ...`)
    }

    const observable = await config.source.fetchData({ watch: this.watch })
    observable.subscribe({
      next: async (cache) => {
        await fs.writeFile(cacheFilePath, JSON.stringify(cache, null, 2))
        console.log(`Data cache file successfully written to ${cacheFilePath}`)
      },
    })

    // for await (const cache of config.source.fetchData({ watch: this.watch })) {
    // for await (const cache of config.source.fetchData({ watch: this.watch })) {
    //   await fs.writeFile(cacheFilePath, JSON.stringify(cache, null, 2))
    //   console.log(`Data cache file successfully written to ${cacheFilePath}`)
    // }

    // if (this.watch) {
    //   watch(filePaths).on('change', async () => {
    // const cache = await config.source.fetchData()
    //     await fetch({ filePaths, schemaDef, cachePath: this.cachePath })
    //   })
    // } else {
    // //   await fetch({ filePaths, schemaDef, cachePath: this.cachePath })

    // // NOTE this helps dev servers (e.g. Next.js) to pick up the file change
    // // if (await fileExists(cacheFilePath)) {
    // //   await fs.unlink(cacheFilePath)
    // // }
    // const cache = await config.source.fetchData()
    // await fs.writeFile(cacheFilePath, JSON.stringify(cache, null, 2))
    // }
  }
}
