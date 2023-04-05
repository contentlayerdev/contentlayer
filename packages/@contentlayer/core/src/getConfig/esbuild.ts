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

export class KnownEsbuildError extends Tagged('KnownEsbuildError')<{
  readonly error: esbuild.Message | esbuild.Message[]
}> {
  toString = () => `KnownEsbuildError: ${JSON.stringify(this.error, null, 2)}`
}

class ConcreteEsbuildWatcher implements EsbuildWatcher {
  readonly [EsbuildWatcherTypeId]: EsbuildWatcherTypeId = EsbuildWatcherTypeId

  constructor(
    private initialBuildResult: Ref.Ref<O.Option<esbuild.BuildResult>>,
    private buildContext: Ref.Ref<O.Option<esbuild.BuildContext>>,
    public buildOptions: esbuild.BuildOptions,
    private fsEventsHub: H.Hub<Ex.Exit<never, E.Either<EsbuildError, esbuild.BuildResult>>>, // public readonly paths: readonly string[], // public readonly options?: Chokidar.WatchOptions
  ) {}

  shutdown: T.Effect<unknown, never, void> = pipe(
    Ref.get(this.buildContext),
    T.chain((buildContext) =>
      T.tryPromise(async () => {
        if (O.isSome(buildContext)) {
          return buildContext.value.dispose()
        } else {
          throw new Error(`This should never happen. Esbuild build context is not set.`)
        }
      }),
    ),
    T.catchAll((_) => T.unit),
  )

  start: T.Effect<OT.HasTracer, never, void> = pipe(
    T.suspend(() => {
      const { fsEventsHub, buildOptions, initialBuildResult } = this
      const self = this // eslint-disable-line @typescript-eslint/no-this-alias
      return T.gen(function* ($) {
        const runtime = yield* $(T.runtime<OT.HasSpan>())

        const buildWatchPlugin: esbuild.Plugin = {
          name: 'contentlayer-watch-plugin',
          setup(build) {
            let isFirstBuild = false

            build.onEnd((result) => {
              runtime.runFiber(OT.addEvent('esbuild-build-result', { result: JSON.stringify(result) }))

              if (isFirstBuild) {
                isFirstBuild = false
              } else {
                if (result.errors.length > 0) {
                  runtime.runFiber(
                    H.publish_(fsEventsHub, Ex.succeed(E.left(new KnownEsbuildError({ error: result.errors })))),
                  )
                } else {
                  runtime.runFiber(H.publish_(fsEventsHub, Ex.succeed(E.right(result!))))
                }
              }
            })
          },
        }

        const buildContext = yield* $(
          T.tryCatchPromise(
            () =>
              esbuild.context({
                ...buildOptions,
                plugins: [buildWatchPlugin, ...(buildOptions.plugins ?? [])],
              }),
            (error) => new UnknownEsbuildError({ error }),
          ),
        )

        yield* $(Ref.set_(self.buildContext, O.some(buildContext)))

        yield* $(
          T.tryCatchPromise(
            // TODO remove `async` once `watch()` returns a Promise (bug in esbuild)
            async () => buildContext.watch(),
            (error) => new UnknownEsbuildError({ error }),
          ),
        )

        yield* $(
          pipe(
            T.tryCatchPromise(
              () => buildContext.rebuild(),
              (error) => new UnknownEsbuildError({ error }),
            ),
            T.tap((res) => Ref.set_(initialBuildResult, O.some(res))),
            T.tap((res) => H.publish_(fsEventsHub, Ex.succeed(E.right(res)))),
            OT.withSpan('esbuild:initial-rebuild'),
          ),
        )
      })
    }),
    OT.withSpan('esbuild:start', { attributes: { buildOptions: JSON.stringify(this.buildOptions) } }),
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
  T.gen(function* ($) {
    const initialBuildResult = yield* $(Ref.makeRef<O.Option<esbuild.BuildResult>>(O.none))
    const hub = yield* $(H.makeUnbounded<Ex.Exit<never, E.Either<EsbuildError, esbuild.BuildResult>>>())
    const buildContext = yield* $(Ref.makeRef<O.Option<esbuild.BuildContext>>(O.none))

    return new ConcreteEsbuildWatcher(initialBuildResult, buildContext, buildOptions, hub)
  })

export const subscribe = (
  self: EsbuildWatcher,
): M.Managed<unknown, never, S.Stream<unknown, never, E.Either<EsbuildError, esbuild.BuildResult>>> => {
  concrete(self)

  return self.subscribe
}

const start = (self: EsbuildWatcher): T.Effect<OT.HasTracer, never, void> => {
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

export const esbuildOnce = (
  buildOptions: esbuild.BuildOptions,
): T.Effect<OT.HasTracer, EsbuildError, esbuild.BuildResult> =>
  pipe(
    T.tryPromise(() => esbuild.build(buildOptions)),
    T.chain((result) =>
      result.errors.length > 0 ? T.fail(new KnownEsbuildError({ error: result.errors })) : T.succeed(result),
    ),
    T.mapError((error) => new UnknownEsbuildError({ error })),
    OT.withSpan('esbuild:build'),
  )
