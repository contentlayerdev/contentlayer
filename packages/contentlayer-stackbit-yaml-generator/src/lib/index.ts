import type { YamlConfig } from '@stackbit/sdk'

export type Transform = (config: YamlConfig) => YamlConfig

export const defineTransform = (transform: Transform): Transform => transform
