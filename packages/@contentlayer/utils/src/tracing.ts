import type { Span } from '@opentelemetry/api'
import { SpanStatusCode, trace } from '@opentelemetry/api'

export const tracer = trace.getTracer('contentlayer')

export const traceAsync = <Res>(spanName: string, fn: () => Promise<Res>): Promise<Res> => {
  return tracer.startActiveSpan(spanName, (span) => {
    return fn()
      .catch((e) => {
        span.setStatus({ code: SpanStatusCode.ERROR, message: e.toString() })
        throw e
      })
      .finally(() => span.end())
  })
}

const identityAllArgs = <T extends any[]>(..._: T): T => _

export const traceAsyncFn =
  <T extends any[]>(spanName: string, mapSpanArgs: (...args: T) => any = identityAllArgs) =>
  <U>(fn: (...args: T) => Promise<U>) => {
    return (...args: T): Promise<U> => {
      return tracer.startActiveSpan(spanName, (span) => {
        addArgsToSpan(span, mapSpanArgs(...args))

        return fn(...args)
          .catch((e) => {
            span.setStatus({ code: SpanStatusCode.ERROR, message: e.toString() })
            throw e
          })
          .finally(() => {
            span.end()
          })
      })
    }
  }

export const traceFn =
  <T extends any[]>(spanName: string, mapSpanArgs: (...args: T) => any = identityAllArgs) =>
  <U>(fn: (...args: T) => U) => {
    return (...args: T): U => {
      return tracer.startActiveSpan(spanName, (span) => {
        addArgsToSpan(span, mapSpanArgs(...args))

        try {
          return fn(...args)
        } catch (e) {
          span.setStatus({ code: SpanStatusCode.ERROR, message: e.toString() })
          throw e
        } finally {
          span.end()
        }
      })
    }
  }

/**
 * Creates a tuple of a `start` and `end` function for a span.
 * e.g. helpful when used together with RxJS taps
 */
type SpanTuple = { start: () => void; end: () => void }
export const makeSpanTuple = (spanName: string): SpanTuple => {
  let span: Span | undefined = undefined

  const start = () => {
    const span_ = tracer.startSpan(spanName)
    span = span_
  }

  const end = () => span?.end()

  return { start, end }
}

const addArgsToSpan = (span: Span, args: any | any[]): void => {
  try {
    if (Array.isArray(args)) {
      for (const [key, arg] of args.entries()) {
        span.setAttribute(`args.${key}`, JSON.stringify(arg, null, 2))
      }
    } else {
      span.setAttribute(`args`, JSON.stringify(args, null, 2))
    }
  } catch (_) {}
}
