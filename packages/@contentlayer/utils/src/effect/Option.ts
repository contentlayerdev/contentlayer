import { Option } from '@effect-ts/core'

export * from '@effect-ts/core/Option'

export const getUnsafe = <A>(option: Option.Option<A>): A => {
  if (Option.isSome(option)) {
    return option.value
  }

  throw new Error('Option.getUnsafe: Option is None')
}
