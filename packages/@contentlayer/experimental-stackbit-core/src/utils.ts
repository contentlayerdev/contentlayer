import type * as StackbitTypes from '@stackbit/types'

export const createNoopLogger = (): StackbitTypes.Logger => ({
  debug: () => {},
  error: () => {},
  info: () => {},
  warn: () => {},
  createLogger: () => createNoopLogger(),
})
