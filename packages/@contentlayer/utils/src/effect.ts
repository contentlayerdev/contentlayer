import { pipe } from '@effect-ts/core'
import * as Chunk from '@effect-ts/core/Collections/Immutable/Chunk'
import * as Tuple from '@effect-ts/core/Collections/Immutable/Tuple'
import * as T from '@effect-ts/core/Effect'
import * as S from '@effect-ts/core/Effect/Stream'

export const streamStartWith =
  <R, E, A>(...values: A[]) =>
  <A1>(stream: S.Stream<R, E, A | A1>) =>
    S.merge_(stream, S.fromChunk(Chunk.from(values)))

export const log = (...args: any[]) =>
  T.succeedWith(() => {
    console.log(...args)
  })

export const streamTapSkipFirst =
  <R, R1, E, E1, O, X>(f: (o: O) => T.Effect<R1, E1, X>) =>
  (stream: S.Stream<R, E, O>): S.Stream<R & R1, E | E1, O> =>
    pipe(
      stream,
      S.zipWithIndex,
      S.tap(({ tuple: [val, index] }) => (index === 0 ? T.succeed(null) : f(val))),
      S.map(({ tuple: [val] }) => val),
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
