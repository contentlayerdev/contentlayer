import { errorToString } from '@contentlayer/utils'
import { E, Ex, H, M, O, OT, pipe, Q, Ref, S, T, Tagged } from '@contentlayer/utils/effect'
import * as esbuild from 'esbuild'

export const EsbuildWatcherTypeId = Symbol()
export type EsbuildWatcherTypeId = typeof EsbuildWatcherTypeId

export abstract class EsbuildWatcher {
  readonly [EsbuildWatcherTypeId]: EsbuildWatcherTypeId = EsbuildWatcherTypeId
}

export type BuildResult = esbuild.BuildResult
export type Plugin = esbuild.Plugin

export type EsbuildError = UnknownEsbuildError | KnownEsbuildError

export class UnknownEsbuildError extends Tagged('UnknownEsbuildError')<{ readonly error: unknown }> {
  toString = () => `UnknownEsbuildError: ${errorToString(this.error)}`
}

export class KnownEsbuildError extends Tagged('KnownEsbuildError')<{ readonly error: esbuild.BuildFailure }> {
  toString = () => `KnownEsbuildError: ${JSON.stringify(this.error, null, 2)}`
}

class ConcreteEsbuildWatcher implements EsbuildWatcher {
  readonly [EsbuildWatcherTypeId]: EsbuildWatcherTypeId = EsbuildWatcherTypeId

  constructor(
    private initialBuildResult: Ref.Ref<O.Option<esbuild.BuildResult>>,
    public buildOptions: esbuild.BuildOptions,
    private fsEventsHub: H.Hub<Ex.Exit<never, E.Either<EsbuildError, esbuild.BuildResult>>>, // public readonly paths: readonly string[], // public readonly options?: Chokidar.WatchOptions
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
                T.run(H.publish_(this.fsEventsHub, Ex.succeed(E.left(new KnownEsbuildError({ error })))))
              } else {
                T.run(H.publish_(this.fsEventsHub, Ex.succeed(E.right(result!))))
              }
            },
          },
        }),
      (error) => new UnknownEsbuildError({ error }),
    ),
    OT.withSpan('esbuild', { attributes: { buildOptions: JSON.stringify(this.buildOptions) } }),
    T.tap((initialBuildResult) => Ref.set_(this.initialBuildResult, O.some(initialBuildResult))),
    T.tap((initialBuildResult) => H.publish_(this.fsEventsHub, Ex.succeed(E.right(initialBuildResult)))),
    T.catchAll((error) => H.publish_(this.fsEventsHub, Ex.succeed(E.left(error)))),
  )

  subscribe: M.Managed<unknown, never, S.Stream<unknown, never, E.Either<EsbuildError, esbuild.BuildResult>>> = pipe(
    H.subscribe(this.fsEventsHub),
    M.chain((_) => M.ensuringFirst_(M.succeed(S.fromQueue()(_)), Q.shutdown(_))),
    M.map(S.flattenExit),
  )
}

function concrete(esbuildWatcher: EsbuildWatcher): asserts esbuildWatcher is ConcreteEsbuildWatcher {
  //
}

export const make = (buildOptions: esbuild.BuildOptions): T.Effect<unknown, never, EsbuildWatcher> =>
  pipe(
    Ref.makeRef<O.Option<esbuild.BuildResult>>(O.none),
    T.zip(H.makeUnbounded<Ex.Exit<never, E.Either<EsbuildError, esbuild.BuildResult>>>()),
    T.chain(({ tuple: [initialBuildResult, hub] }) =>
      T.succeedWith(() => new ConcreteEsbuildWatcher(initialBuildResult, buildOptions, hub)),
    ),
    // T.tap((_) => _.start),
  )

export const subscribe = (
  self: EsbuildWatcher,
): M.Managed<unknown, never, S.Stream<unknown, never, E.Either<EsbuildError, esbuild.BuildResult>>> => {
  concrete(self)

  return self.subscribe
}

export const start = (self: EsbuildWatcher): T.Effect<OT.HasTracer, never, void> => {
  concrete(self)

  return self.start
}

// export const makeAndSubscribeManaged = (
//   buildOptions: esbuild.BuildOptions,
// ): M.Managed<unknown, UnknownEsbuildError, S.Stream<unknown, never, E.Either<EsbuildError, esbuild.BuildResult>>> =>
//   pipe(M.make_(make(buildOptions), shutdown), M.chain(subscribe))

export const makeAndSubscribeManaged = (
  buildOptions: esbuild.BuildOptions,
): M.Managed<OT.HasTracer, never, S.Stream<unknown, never, E.Either<EsbuildError, esbuild.BuildResult>>> =>
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
): S.Stream<OT.HasTracer, never, E.Either<EsbuildError, esbuild.BuildResult>> =>
  pipe(makeAndSubscribeManaged(buildOptions), S.unwrapManaged)

export const shutdown = (self: EsbuildWatcher): T.Effect<unknown, never, void> => {
  concrete(self)

  return self.shutdown
}
