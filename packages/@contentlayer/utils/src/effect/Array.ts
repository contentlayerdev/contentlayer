import { Array, pipe } from '@effect-ts/core'

import * as O from './Option.js'

export * from '@effect-ts/core/Collections/Immutable/Array'

export const headUnsafe = <A>(array: Array.Array<A>): A => pipe(array, Array.head, O.getUnsafe)
