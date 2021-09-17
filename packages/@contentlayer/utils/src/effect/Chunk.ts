import { Chunk } from '@effect-ts/core'
import type { Separated } from '@effect-ts/system/Utils'

import { E, O, These } from '.'

export * from '@effect-ts/core/Collections/Immutable/Chunk'

export const partitionThese = <E, A>(
  chunk: Chunk.Chunk<These.These<E, A>>,
): Separated<Chunk.Chunk<E>, Chunk.Chunk<A>> => {
  let errors = Chunk.empty<E>()
  let values = Chunk.empty<A>()

  Chunk.forEach_(chunk, (a) => {
    const res = These.result(a)
    if (E.isLeft(res)) {
      errors = Chunk.append_(errors, res.left)
    } else {
      values = Chunk.append_(values, res.right.tuple[0])
      const warning = res.right.tuple[1]
      if (O.isSome(warning)) {
        errors = Chunk.append_(errors, warning.value)
      }
    }
  })

  return {
    left: errors,
    right: values,
  }
}
