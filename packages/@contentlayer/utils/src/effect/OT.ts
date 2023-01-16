import { Effect as T, Managed as M, Option as O, pipe } from '@effect-ts/core'
import { pretty } from '@effect-ts/core/Effect/Cause/Pretty'
import * as S from '@effect-ts/core/Effect/Experimental/Stream'
import type { Has } from '@effect-ts/core/Has'
import * as OT from '@effect-ts/otel'
import * as OTApi from '@opentelemetry/api'

export * from '@effect-ts/otel'
export type HasSpan = Has<OT.Span>

export const withStreamSpan =
  (name: string, options?: OTApi.SpanOptions, ctx?: OTApi.Context) =>
  <R, E, A>(stream: S.Stream<R & HasSpan, E, A>): S.Stream<R & OT.HasTracer, E, A> =>
    pipe(
      // NOTE we're using this weird `S.access` + `S.chain` here since `T.access` seems to be buggy
      // TODO fix this with Effect 2 🤠
      S.access((r: R & OT.HasTracer) => r),
      S.chain((r) =>
        pipe(
          M.gen(function* ($) {
            const span = yield* $(
              M.makeExit_(
                pipe(
                  T.succeedWith(() => {
                    const { tracer } = OT.Tracer.read(r)

                    const maybeSpan = OT.Span.readOption(r)
                    if (ctx) {
                      return tracer.startSpan(name, options, ctx)
                    }
                    if (options?.root !== true && O.isSome(maybeSpan)) {
                      const ctx = OTApi.trace.setSpan(OTApi.context.active(), maybeSpan.value.span)
                      return tracer.startSpan(name, options, ctx)
                    }
                    return tracer.startSpan(name, { ...options, root: true })
                  }),
                ),

                (s, e) =>
                  T.succeedWith(() => {
                    if (e._tag === 'Failure') {
                      s.setAttribute('error.type', 'Fiber Failure')
                      s.setAttribute('error.message', 'An Effect Has A Failure')
                      s.setAttribute('error.stack', pretty(e.cause))
                      s.setStatus({ code: OTApi.SpanStatusCode.ERROR })
                    } else {
                      s.setStatus({ code: OTApi.SpanStatusCode.OK })
                    }
                    s.end()
                  }),
              ),
            )

            return pipe(stream, S.provideAll({ ...r, ...OT.Span.has(new OT.SpanImpl(span)) }))
          }),
          S.unwrapManaged,
        ),
      ),
    )
