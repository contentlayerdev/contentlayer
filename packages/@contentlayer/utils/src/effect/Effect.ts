// ets_tracing: off

import { Chunk, Effect as T, Either as E, pipe } from '@effect-ts/core'
import * as Tuple from '@effect-ts/core/Collections/Immutable/Tuple'

export * from '@effect-ts/core/Effect'

export const log = (...args: any[]) =>
  T.succeedWith(() => {
    console.log(...args)
  })

export const rightOrFail = <R, E1, EE1, A>(
  effect: T.Effect<R, E1, E.Either<EE1, A>>,
  __trace?: string,
): T.Effect<R, E1 | EE1, A> =>
  T.chain_(
    effect,
    E.fold(
      (x) => T.fail(x, __trace),
      (x) => T.succeed(x, __trace),
    ),
  )

export const forEachParDict =
  <A, R, E, B>({
    mapKey,
    mapValue,
  }: {
    mapKey: (a: A) => T.Effect<R, E, string>
    mapValue: (a: A) => T.Effect<R, E, B>
  }) =>
  (as: Iterable<A>): T.Effect<R, E, Record<string, B>> =>
    pipe(
      as,
      T.forEach((a) => T.tuplePar(mapKey(a), mapValue(a))),
      T.map(Chunk.map(Tuple.toNative)),
      T.map(Chunk.toArray),
      T.map(Object.fromEntries),
    )

export const forEachParDict_ = <A, R, E, B>(
  as: Iterable<A>,
  {
    mapKey,
    mapValue,
  }: {
    mapKey: (a: A) => T.Effect<R, E, string>
    mapValue: (a: A) => T.Effect<R, E, B>
  },
): T.Effect<R, E, Record<string, B>> =>
  pipe(
    as,
    T.forEach((a) => T.tuplePar(mapKey(a), mapValue(a))),
    T.map(Chunk.map(Tuple.toNative)),
    T.map(Chunk.toArray),
    T.map(Object.fromEntries),
  )
