import { fetchDataAndCache, getConfig } from '@contentlayer/core'
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
    const source = await getConfig({ configPath: this.configPath, cwd: process.cwd() })
    fetchDataAndCache({ source, cachePath: this.cachePath, watch: this.watch ?? false }).subscribe()
  }
}
