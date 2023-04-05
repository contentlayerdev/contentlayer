import { pipe } from '@effect-ts/core'
import * as Chunk from '@effect-ts/core/Collections/Immutable/Chunk'
import * as Tuple from '@effect-ts/core/Collections/Immutable/Tuple'
import * as T from '@effect-ts/core/Effect'
import * as S from '@effect-ts/core/Effect/Experimental/Stream'
import * as E from '@effect-ts/core/Either'

export * from '@effect-ts/core/Effect/Experimental/Stream'

export const streamTapSkipFirst =
  <R1, E1, O, X>(f: (o: O) => T.Effect<R1, E1, X>) =>
  <R, E>(stream: S.Stream<R, E, O>): S.Stream<R & R1, E | E1, O> =>
    pipe(
      stream,
      S.mapAccumEffect(0, (x, o) =>
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

export const tapLeft =
  <R1, R2, E1, EE1, A1>(f: (e: EE1) => T.Effect<R2, never, unknown>) =>
  (stream: S.Stream<R1, E1, E.Either<EE1, A1>>): S.Stream<R1 & R2, E1, E.Either<EE1, A1>> =>
    pipe(
      stream,
      S.tap((val) => (E.isLeft(val) ? f(val.left) : T.succeed(null))),
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
      E.fold(
        (_left) => stream as any,
        (right) => mapRight(right),
      ),
      1,
    )(stream)
  }

export const mapEffectEitherRight =
  <R2, E2, A2, A1>(mapRight: (a1: A1) => T.Effect<R2, never, E.Either<E2, A2>>) =>
  <R1, E1>(stream: S.Stream<R1, never, E.Either<E1, A1>>): S.Stream<R1 & R2, never, E.Either<E1 | E2, A2>> => {
    return S.mapEffect_(
      stream,
      E.fold(
        (left) => T.succeed(E.leftW<E1 | E2, A2>(left)),
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

export const fromValue = <A>(a: A) => S.fromEffect(T.succeed(a))
