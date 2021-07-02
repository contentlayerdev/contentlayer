import type { SourcePlugin } from './plugin'

export type Config = SourcePlugin

// export type Config = {
//   source: SourcePlugin
// }

export function defineConfig(_: Config): Config {
  return _
}
