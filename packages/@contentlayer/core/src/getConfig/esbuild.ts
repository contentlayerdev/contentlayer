import { Tagged } from '@effect-ts/core/Case'
import * as T from '@effect-ts/core/Effect'
import * as Ex from '@effect-ts/core/Effect/Exit'
import * as S from '@effect-ts/core/Effect/Experimental/Stream'
import * as H from '@effect-ts/core/Effect/Hub'
import * as M from '@effect-ts/core/Effect/Managed'
import * as Q from '@effect-ts/core/Effect/Queue'
import * as Ref from '@effect-ts/core/Effect/Ref'
import { pipe } from '@effect-ts/core/Function'
import * as O from '@effect-ts/core/Option'
import * as OT from '@effect-ts/otel'
import * as esbuild from 'esbuild'

export const EsbuildWatcherTypeId = Symbol()
export type EsbuildWatcherTypeId = typeof EsbuildWatcherTypeId

export abstract class EsbuildWatcher {
  readonly [EsbuildWatcherTypeId]: EsbuildWatcherTypeId = EsbuildWatcherTypeId
}

export type EsbuildError = UnknownEsbuildError | esbuild.BuildFailure

export class UnknownEsbuildError extends Tagged('UnknownEsbuildError')<{ readonly error: unknown }> {}

class ConcreteEsbuildWatcher implements EsbuildWatcher {
  readonly [EsbuildWatcherTypeId]: EsbuildWatcherTypeId = EsbuildWatcherTypeId

  constructor(
    private initialBuildResult: Ref.Ref<O.Option<esbuild.BuildResult>>,
    public buildOptions: esbuild.BuildOptions,
    private fsEventsHub: H.Hub<Ex.Exit<EsbuildError, esbuild.BuildResult>>, // public readonly paths: readonly string[], // public readonly options?: Chokidar.WatchOptions
  ) {}

  shutdown: T.Effect<unknown, never, void> = pipe(
    this.initialBuildResult,
    Ref.get,
    T.chain((initialBuildResult) => {
      if (O.isSome(initialBuildResult)) {
        return T.tryCatch(
          () => initialBuildResult.value.stop!(),
          (error) => new UnknownEsbuildError({ error }),
        )
      }
      console.log(`This shouldn't happen. Seems like esbuild watcher wasn't running (yet).`)
      return T.unit
    }),
    T.catchAll((_) => T.unit),
  )

  start: T.Effect<OT.HasTracer, never, void> = pipe(
    T.tryCatchPromise(
      () =>
        esbuild.build({
          ...this.buildOptions,
          watch: {
            onRebuild: (error, result) => {
              if (error) {
                T.run(H.publish_(this.fsEventsHub, Ex.fail(error)))
              } else {
                T.run(H.publish_(this.fsEventsHub, Ex.succeed(result!)))
              }
            },
          },
        }),
      (error) => new UnknownEsbuildError({ error }),
    ),
    OT.withSpan('esbuild', { attributes: { buildOptions: JSON.stringify(this.buildOptions) } }),
    T.tap((initialBuildResult) => Ref.set_(this.initialBuildResult, O.some(initialBuildResult))),
    T.tap((initialBuildResult) => H.publish_(this.fsEventsHub, Ex.succeed(initialBuildResult))),
    T.catchAll((error) => H.publish_(this.fsEventsHub, Ex.fail(error))),
  )

  subscribe: M.Managed<unknown, never, S.Stream<unknown, EsbuildError, esbuild.BuildResult>> = pipe(
    H.subscribe(this.fsEventsHub),
    M.chain((_) => M.ensuringFirst_(M.succeed(S.fromQueue()(_)), Q.shutdown(_))),
    M.map(S.flattenExit),
  )
}

function concrete(esbuildWatcher: EsbuildWatcher): asserts esbuildWatcher is ConcreteEsbuildWatcher {
  //
}

export const make = (buildOptions: esbuild.BuildOptions): T.Effect<unknown, UnknownEsbuildError, EsbuildWatcher> =>
  pipe(
    Ref.makeRef<O.Option<esbuild.BuildResult>>(O.none),
    T.zip(H.makeUnbounded<Ex.Exit<EsbuildError, esbuild.BuildResult>>()),
    T.chain(({ tuple: [initialBuildResult, hub] }) =>
      T.succeedWith(() => new ConcreteEsbuildWatcher(initialBuildResult, buildOptions, hub)),
    ),
    // T.tap((_) => _.start),
  )

export const subscribe = (
  self: EsbuildWatcher,
): M.Managed<unknown, UnknownEsbuildError, S.Stream<unknown, EsbuildError, esbuild.BuildResult>> => {
  concrete(self)

  return self.subscribe
}

export const start = (self: EsbuildWatcher): T.Effect<OT.HasTracer, never, void> => {
  concrete(self)

  return self.start
}

// export const makeAndSubscribeManaged = (
//   buildOptions: esbuild.BuildOptions,
// ): M.Managed<unknown, UnknownEsbuildError, S.Stream<unknown, EsbuildError, esbuild.BuildResult>> =>
//   pipe(M.make_(make(buildOptions), shutdown), M.chain(subscribe))

export const makeAndSubscribeManaged = (
  buildOptions: esbuild.BuildOptions,
): M.Managed<OT.HasTracer, UnknownEsbuildError, S.Stream<unknown, EsbuildError, esbuild.BuildResult>> =>
  pipe(
    M.make_(make(buildOptions), shutdown),
    M.chain((esbuildWatcher) =>
      pipe(
        subscribe(esbuildWatcher),
        M.tap(() => T.toManaged(start(esbuildWatcher))),
      ),
    ),
  )

export const makeAndSubscribe = (
  buildOptions: esbuild.BuildOptions,
): S.Stream<OT.HasTracer, EsbuildError, esbuild.BuildResult> =>
  pipe(makeAndSubscribeManaged(buildOptions), S.unwrapManaged)

export const shutdown = (self: EsbuildWatcher): T.Effect<unknown, never, void> => {
  concrete(self)

  return self.shutdown
}
