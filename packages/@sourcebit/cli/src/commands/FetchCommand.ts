import { fetchDataAndCache, getConfig } from '@sourcebit/core'
import { Option } from 'clipanion'
import * as t from 'typanion'
import { BaseCommand } from './_BaseCommand'

export class FetchCommand extends BaseCommand {
  static paths = [['fetch']]

  cachePath = Option.String('--cache', {
    required: false,
    validator: t.isString(),
  })

  watch = Option.Boolean('--watch,-w', {})

  async executeSafe() {
    const config = await getConfig({ configPath: this.configPath, cwd: process.cwd() })
    fetchDataAndCache({ config, cachePath: this.cachePath, watch: this.watch }).subscribe()
  }
}
