import { SourcePlugin } from './plugin'

export type Config = {
  source: SourcePlugin
}

export function defineConfig(_: Config): Config {
  return _
}
