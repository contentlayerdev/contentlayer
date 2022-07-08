// ets_tracing: off

// copied from https://github.com/Effect-TS/schema/blob/master/packages/schema/src/These/index.ts

import { pipe } from '@effect-ts/core'
import * as Tp from '@effect-ts/core/Collections/Immutable/Tuple'
import { _A, _E } from '@effect-ts/core/Effect'

import { E, O, T } from './index.js'

export class These<E, A> {
  readonly [_E]!: () => E;
  readonly [_A]!: () => A
  constructor(readonly either: E.Either<E, Tp.Tuple<[A, O.Option<E>]>>) {}
}

export function succeed<A>(a: A) {
  return new These(E.right(Tp.tuple(a, O.none)))
}

export function warn<E, A>(a: A, e: E) {
  return new These(E.right(Tp.tuple(a, O.some(e))))
}

export function warnOption<E, A>(a: A, e: O.Option<E>) {
  return new These(E.right(Tp.tuple(a, e)))
}

export function fail<E>(e: E) {
  return new These<E, never>(E.left(e))
}

export const isNonFailure = <E, A>(self: These<E, A>): self is These<never, A> => E.isRight(self.either)

export function foldM_<E, A, E1, A1, E2, A2, E3, A3>(
  self: These<E, A>,
  onSuccess: (a: A) => These<E1, A1>,
  onBoth: (a: A, e: E) => These<E2, A2>,
  onFail: (e: E) => These<E3, A3>,
): These<E1 | E2 | E3, A1 | A2 | A3> {
  return new These(
    E.fold_(
      self.either,
      (x): E.Either<E1 | E2 | E3, Tp.Tuple<[A1 | A2 | A3, O.Option<E1 | E2 | E3>]>> => onFail(x).either,
      ({ tuple: [result, warnings] }) =>
        warnings._tag === 'None' ? onSuccess(result).either : onBoth(result, warnings.value).either,
    ),
  )
}

export function foldM<E, A, E1, A1, E2, A2, E3, A3>(
  onSuccess: (a: A) => These<E1, A1>,
  onBoth: (a: A, e: E) => These<E2, A2>,
  onFail: (e: E) => These<E3, A3>,
) {
  return (self: These<E, A>): These<E1 | E2 | E3, A1 | A2 | A3> => foldM_(self, onSuccess, onBoth, onFail)
}

export function map_<E, A0, A>(self: These<E, A0>, f: (a: A0) => A) {
  return foldM_(
    self,
    (a) => succeed(f(a)),
    (a, e) => warn(f(a), e),
    fail,
  )
}

export function map<A0, A>(f: (a: A0) => A) {
  return <E>(self: These<E, A0>) => map_(self, f)
}

export function mapError_<E0, E, A>(self: These<E0, A>, f: (a: E0) => E): These<E, A> {
  return foldM_(
    self,
    (a) => succeed(a),
    (a, e) => warn(a, f(e)),
    (e) => fail(f(e)),
  )
}

export function mapError<E0, E>(f: (a: E0) => E): <A>(self: These<E0, A>) => These<E, A> {
  return (self) => mapError_(self, f)
}

export function chain_<E0, A0, E, A>(self: These<E0, A0>, f: (a: A0, w: O.Option<E0>) => These<E, A>) {
  return foldM_(
    self,
    (a) => f(a, O.none),
    (a, _) => f(a, O.some(_)),
    fail,
  )
}

export function chain<E0, A0, E, A>(f: (a: A0, w: O.Option<E0>) => These<E, A>) {
  return (self: These<E0, A0>) => chain_(self, f)
}

export function result<E, A>(self: These<E, A>): E.Either<E, Tp.Tuple<[A, O.Option<E>]>> {
  return self.either
}

export const errorOrWaning = <E, A>(self: These<E, A>): O.Option<E> => {
  return E.fold_(self.either, O.some, (tp) => tp.get(1))
}

/** Unpacks the provided `These` into a new `Effect` with errors as `E` and values as value/warning tuple */
export const toEffect = <E, A>(self: These<E, A>): T.Effect<unknown, E, Tp.Tuple<[A, O.Option<E>]>> => {
  return pipe(result(self), E.fold(T.fail, T.succeed))
}

export const effectUnwrapValue = <T, E1, E2, A>(effect: T.Effect<T, E1, These<E2, A>>): T.Effect<T, E1 | E2, A> => {
  return pipe(
    effect,
    T.chain((these) => E.fold_(these.either, T.fail, ({ tuple: [a] }) => T.succeed(a))),
  )
}

export const effectTapSuccess =
  <T1, T2, E1, E2, TE2, A>(tapFn: (a: A) => T.Effect<T1, E1, any>) =>
  (effect: T.Effect<T2, E2, These<TE2, A>>): T.Effect<T1 & T2, E1 | E2, These<TE2, A>> => {
    return T.tap_(effect, (these) =>
      pipe(
        result(these),
        E.fold(
          () => T.unit,
          (tp) => tapFn(tp.get(0)),
        ),
      ),
    )
  }

export const effectTapErrorOrWarning =
  <T1, T2, E1, E2, TE2, A>(tapFn: (te2: TE2) => T.Effect<T1, E1, any>) =>
  (effect: T.Effect<T2, E2, These<TE2, A>>): T.Effect<T1 & T2, E1 | E2, These<TE2, A>> => {
    return T.tap_(effect, (these) =>
      pipe(
        errorOrWaning(these),
        O.fold(
          () => T.unit,
          (e) => tapFn(e),
        ),
      ),
    )
  }

// export const effectValueOrElse = <T, E1, E2, A>(effect: T.Effect<T, E1, These<E2, A>>): T.Effect<T, E1 | E2, A> => {
//   return pipe(
//     effect,
//     T.chain((these) => E.fold_(these.either, T.fail, ({ tuple: [a] }) => T.succeed(a))),
//   )
// }

/** Wraps the error channel of an Effect<_, _ These> into the These */
export const effectThese = <T, E1, E2, A>(
  effect: T.Effect<T, E1, These<E2, A>>,
): T.Effect<T, never, These<E1 | E2, A>> => {
  return pipe(
    effect,
    T.either,
    T.map(
      E.fold(
        (e) => fail(e),
        (t) => t,
      ),
    ),
  )
}

/** Casts warnings to errors (and ignores the value in the warning case) */
export const effectToEither = <R, E1, E2, A>(effect: T.Effect<R, E1, These<E2, A>>): T.Effect<R, E1, E.Either<E2, A>> =>
  pipe(
    effect,
    T.map((these) =>
      E.fold_(
        these.either,
        (e2) => E.left(e2),
        ({ tuple: [val, optE2] }) =>
          O.fold_(
            optE2,
            () => E.right(val),
            (e2) => E.left(e2),
          ),
      ),
    ),
  )
