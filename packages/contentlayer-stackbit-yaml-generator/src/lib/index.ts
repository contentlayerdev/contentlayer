import type * as StackbitTypes from '@stackbit/types'

export type Transform = (config: StackbitTypes.StackbitConfig) => StackbitTypes.StackbitConfig

export const defineTransform = (transform: Transform): Transform => transform
