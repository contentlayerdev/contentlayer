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

export const traceAsyncFn =
  (spanName: string) =>
  <T extends Array<any>, U>(fn: (...args: T) => Promise<U>) => {
    return (...args: T): Promise<U> => {
      return tracer.startActiveSpan(spanName, (span) => {
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
  (spanName: string) =>
  <T extends Array<any>, U>(fn: (...args: T) => U) => {
    return (...args: T): U => {
      return tracer.startActiveSpan(spanName, (span) => {
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
