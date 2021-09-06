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

/**
 * For convenience (instead of providing a mapping function)
 * an array of object keys for the first argument can be provided
 */
type ArgKeysOrArgsMapper<T extends any[]> = (keyof T[0])[] | ((...args: T) => any)

export const traceAsyncFn =
  <T extends any[]>(spanName: string, argsMapper: ArgKeysOrArgsMapper<T> = []) =>
  <U>(fn: (...args: T) => Promise<U>) => {
    return (...args: T): Promise<U> => {
      return tracer.startActiveSpan(spanName, (span) => {
        addArgsToSpan(span, argsMapper, args)

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
  <T extends any[]>(spanName: string, argsMapper: ArgKeysOrArgsMapper<T> = []) =>
  <U>(fn: (...args: T) => U) => {
    return (...args: T): U => {
      return tracer.startActiveSpan(spanName, (span) => {
        addArgsToSpan(span, argsMapper, args)

        try {
          return fn(...args)
        } catch (e: any) {
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

const addArgsToSpan = (span: Span, argsMapper: ArgKeysOrArgsMapper<any>, args: any[]): void => {
  const args_ = Array.isArray(argsMapper)
    ? Object.fromEntries(argsMapper.map((key) => [key, args[0][key]]))
    : argsMapper(...args)

  try {
    if (Array.isArray(args_)) {
      for (const [key, arg] of args_.entries()) {
        span.setAttribute(`args.${key}`, JSON.stringify(arg, null, 2))
      }
    } else {
      span.setAttribute(`args`, JSON.stringify(args_, null, 2))
    }
  } catch (_) {}
}
