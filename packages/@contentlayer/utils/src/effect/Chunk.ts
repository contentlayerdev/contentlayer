import { Chunk } from '@effect-ts/core'

import { E, O, These, Tp } from './index.js'

export * from '@effect-ts/core/Collections/Immutable/Chunk'

/**
 * Separates a Chunk of These into success values on one side and error/warning values on the other side
 * Values are preserved in case of a warning.
 */
export const partitionThese = <E, A>(
  chunk: Chunk.Chunk<These.These<E, A>>,
): Tp.Tuple<[Chunk.Chunk<E>, Chunk.Chunk<A>]> => {
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

  return Tp.tuple(errors, values)
}
