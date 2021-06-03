import { Command, Option } from 'clipanion'
import { performance, PerformanceObserver } from 'perf_hooks'
import * as t from 'typanion'

export abstract class BaseCommand extends Command {
  configPath = Option.String('-c,--config', 'contentlayer.config.ts', {
    description: 'Path to the config',
    validator: t.isString(),
  })

  async execute() {
    if (process.env['CL_PROFILE']) {
      const obs = new PerformanceObserver((items) => {
        items.getEntries().forEach(({ duration, name }) => console.log(`[${name}] ${duration.toFixed(0)}ms`))
        performance.clearMarks()
      })
      obs.observe({ entryTypes: ['measure'] })
    }

    try {
      await this.executeSafe()
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  abstract executeSafe(): Promise<void>
}
