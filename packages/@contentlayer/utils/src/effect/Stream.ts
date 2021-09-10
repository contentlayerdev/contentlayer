import { pipe } from '@effect-ts/core'
import * as Chunk from '@effect-ts/core/Collections/Immutable/Chunk'
import * as Tuple from '@effect-ts/core/Collections/Immutable/Tuple'
import * as T from '@effect-ts/core/Effect'
import * as S from '@effect-ts/core/Effect/Stream'
import * as E from '@effect-ts/core/Either'

export * from '@effect-ts/core/Effect/Stream'

export const streamTapSkipFirst =
  <R1, E1, O, X>(f: (o: O) => T.Effect<R1, E1, X>) =>
  <R, E>(stream: S.Stream<R, E, O>): S.Stream<R & R1, E | E1, O> =>
    pipe(
      stream,
      S.mapAccumM(0, (x, o) =>
        T.gen(function* (_) {
          if (x > 0) {
            yield* _(f(o))
          }
          return Tuple.tuple(x + 1, o)
        }),
      ),
    )

/** Note this function doesn't currently work if the first value is a `E.left` value */
export const tapSkipFirstRight =
  <R1, R2, E1, EE1, E2, A1>(f: (o: A1) => T.Effect<R2, E2, any>) =>
  (stream: S.Stream<R1, E1, E.Either<EE1, A1>>): S.Stream<R1 & R2, E1 | E2, E.Either<EE1, A1>> =>
    pipe(
      stream,
      S.zipWithIndex,
      S.tap(({ tuple: [val, index] }) => (index === 0 || E.isLeft(val) ? T.succeed(null) : f(val.right))),
      S.map(({ tuple: [val] }) => val),
    )

export const tapRight =
  <R1, R2, E1, EE1, A1>(f: (o: A1) => T.Effect<R2, never, unknown>) =>
  (stream: S.Stream<R1, E1, E.Either<EE1, A1>>): S.Stream<R1 & R2, E1, E.Either<EE1, A1>> =>
    pipe(
      stream,
      S.tap((val) => (E.isLeft(val) ? T.succeed(null) : f(val.right))),
    )

export const tapRightEither =
  <R1, R2, E1, EE1, EE2, A1>(f: (o: A1) => T.Effect<R2, never, E.Either<EE2, unknown>>) =>
  (stream: S.Stream<R1, E1, E.Either<EE1, A1>>): S.Stream<R1 & R2, E1, E.Either<EE1 | EE2, A1>> =>
    pipe(
      stream,
      S.tap((val) => (E.isLeft(val) ? T.succeed(null) : f(val.right))),
    )

export const startWith =
  <A2>(...values: A2[]) =>
  <R1, E1, A1>(stream: S.Stream<R1, E1, A1>): S.Stream<R1, E1, A2 | A1> =>
    S.merge_(stream, S.fromChunk(Chunk.from(values)))

export const startWithRight =
  <A2>(value: A2) =>
  <R1, E1, A1>(stream: S.Stream<R1, never, E.Either<E1, A1>>): S.Stream<R1, never, E.Either<E1, A2 | A1>> =>
    S.merge_(stream, S.fromIterable([E.right(value)]))

export const chainMapEitherRight =
  <R2, E2, EE2, A2, A1>(mapRight: (a1: A1) => S.Stream<R2, E2, E.Either<EE2, A2>>) =>
  <R1, E1, EE1>(stream: S.Stream<R1, E1, E.Either<EE1, A1>>): S.Stream<R1 & R2, E1 | E2, E.Either<EE1 | EE2, A2>> => {
    return S.chain_(
      stream,
      E.fold(
        (_left) => stream as any,
        (right) => mapRight(right),
      ),
    )
  }

export const chainSwitchMapEitherRight =
  <R2, E2, EE2, A2, A1>(mapRight: (a1: A1) => S.Stream<R2, E2, E.Either<EE2, A2>>) =>
  <R1, E1, EE1>(stream: S.Stream<R1, E1, E.Either<EE1, A1>>): S.Stream<R1 & R2, E1 | E2, E.Either<EE1 | EE2, A2>> => {
    return S.chainParSwitch<R2, E2, E.Either<EE1, A1>, E.Either<EE2, A2>>(
      1,
      E.fold(
        (_left) => stream as any,
        (right) => mapRight(right),
      ),
    )(stream)
  }

export const mapEffectEitherRight =
  <R2, E2, A2, A1>(mapRight: (a1: A1) => T.Effect<R2, never, E.Either<E2, A2>>) =>
  <R1, E1>(stream: S.Stream<R1, never, E.Either<E1, A1>>): S.Stream<R1 & R2, never, E.Either<E1 | E2, A2>> => {
    return S.mapM_(
      stream,
      E.fold(
        (_left) => stream as any,
        (right) => mapRight(right),
      ),
    )
  }

export const mapEitherLeft =
  <EE2, EE1>(mapLeft: (e1: EE1) => EE2) =>
  <R1, E1, A1>(stream: S.Stream<R1, E1, E.Either<EE1, A1>>): S.Stream<R1, E1, E.Either<EE2, A1>> => {
    return S.map_(stream, E.mapLeft(mapLeft))
  }

export const mapEitherRight =
  <A2, A1>(mapRight: (a1: A1) => A2) =>
  <R1, E1, EE1>(stream: S.Stream<R1, E1, E.Either<EE1, A1>>): S.Stream<R1, E1, E.Either<EE1, A2>> => {
    return S.map_(stream, E.map(mapRight))
  }

export const zipWithLatestEitherRight = <R1X, R1Y, R2, E1X, E1Y, EE1X, EE1Y, A1X, A1Y, A2>(
  streamX: S.Stream<R1X, E1X, E.Either<EE1X, A1X>>,
  streamY: S.Stream<R1Y, E1Y, E.Either<EE1Y, A1Y>>,
  mapRight: (a1X: A1X, a1Y: A1Y) => A2,
): S.Stream<R1X & R1Y & R2, E1X | E1Y, E.Either<EE1X | EE1Y, A2>> => {
  return S.zipWithLatest(
    streamX,
    streamY,
  )((x, y) => {
    if (E.isLeft(x)) return x
    if (E.isLeft(y)) return y
    return E.right(mapRight(x.right, y.right))
  })
}
