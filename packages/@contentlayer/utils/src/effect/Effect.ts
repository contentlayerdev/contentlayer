// ets_tracing: off

import { Cause, Chunk, Effect as T, Either as E, pipe } from '@effect-ts/core'
import * as Tuple from '@effect-ts/core/Collections/Immutable/Tuple'

import { ConsoleService } from './ConsoleService.js'

export * from '@effect-ts/core/Effect'

export type { _A as OutputOf } from '@effect-ts/core/Utils'

// export const log = (...args: any[]) =>
//   T.succeedWith(() => {
//     console.log(...args)
//   })

// NOTE this is temporary until Stackblitz supports deconstructed exports
// export const { log } = T.deriveLifted(ConsoleService)(['log'], [], [])
const log_ = T.deriveLifted(ConsoleService)(['log'], [], [])
export const log = log_.log

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

/** Logs both on errors and defects */
export const tapCauseLogPretty = <R, E, A>(eff: T.Effect<R, E, A>) =>
  T.tapCause_(eff, (err) => T.succeedWith(() => console.error(Cause.pretty(err))))

export const debugLogEnv = (msg?: string) =>
  pipe(
    T.environment(),
    T.tap((env) => log(msg ?? 'debugLogEnv', env)),
  )

export const tryPromiseOrDie = <A>(promise: () => Promise<A>) => pipe(T.tryPromise(promise), T.orDie)

export const sync = <A>(fn: () => A): T.Effect<unknown, never, A> => T.succeedWith(fn)

export const eitherMap =
  <A1, A2>(mapRight: (a1: A1) => A2) =>
  <R, E1, EE1>(effect: T.Effect<R, E1, E.Either<EE1, A1>>, __trace?: string): T.Effect<R, E1, E.Either<EE1, A2>> =>
    T.map_(effect, E.map(mapRight))

export const chainMergeObject =
  <T2, E2, A1 extends {}, A2 extends {}>(effect: (a1: A1) => T.Effect<T2, E2, A2>) =>
  <T1, E1>(self: T.Effect<T1, E1, A1>): T.Effect<T1 & T2, E1 | E2, A1 & A2> =>
    T.chain_(self, (a1) =>
      pipe(
        effect(a1),
        T.map((a2) => ({ ...a1, ...a2 })),
      ),
    )

export const forEachParDict =
  <A, R, E, B>(args: { mapKey: (a: A) => T.Effect<R, E, string>; mapValue: (a: A) => T.Effect<R, E, B> }) =>
  (as: Iterable<A>): T.Effect<R, E, Record<string, B>> =>
    forEachParDict_(as, args)

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

export const tapSync =
  <A>(tapFn: (a: A) => unknown) =>
  <R, E>(eff: T.Effect<R, E, A>) =>
    T.tap_(eff, (a) => T.succeedWith(() => tapFn(a)))
