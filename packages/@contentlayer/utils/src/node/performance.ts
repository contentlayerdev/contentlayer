import { performance, PerformanceObserver } from 'perf_hooks'

export const logPerformance = () => {
  if (process.env['CL_PROFILE']) {
    const obs = new PerformanceObserver((items) => {
      items.getEntries().forEach(({ duration, name }) => console.log(`[${name}] ${duration.toFixed(0)}ms`))
      performance.clearMarks()
    })
    obs.observe({ entryTypes: ['measure'] })
  }
}

export const measurePromise = <T>(name: string, promise: Promise<T>) => {
  if (process.env['CL_PROFILE']) {
    performance.mark(`${name}:start`)

    return promise.finally(() => {
      performance.mark(`${name}:stop`)
      performance.measure(`${name}`, `${name}:start`, `${name}:stop`)
    })
  } else {
    return promise
  }
}

export const measureAsync =
  (name: string) =>
  <T extends Array<any>, U>(fn: (...args: T) => Promise<U>) => {
    return (...args: T): Promise<U> => {
      if (process.env['CL_PROFILE']) {
        performance.mark(`${name}:start`)
        return fn(...args).finally(() => {
          performance.mark(`${name}:stop`)
          performance.measure(`${name}`, `${name}:start`, `${name}:stop`)
        })
      } else {
        return fn(...args)
      }
    }
  }
