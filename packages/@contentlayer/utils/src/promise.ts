import { performance } from 'perf_hooks'

export const promiseMap = <T, Res>(arr: T[], map: (el: T, index?: number) => Res | Promise<Res>) =>
  Promise.all(arr.map(map))

export const promiseMapDict = async <T, Res>(
  dict: Record<string, T>,
  map: (el: T, index?: number) => Res | Promise<Res>,
): Promise<Record<string, Res>> => {
  const mappedEntries = await Promise.all(Object.entries(dict).map(async ([key, val]) => [key, await map(val)]))
  return Object.fromEntries(mappedEntries)
}

export const promiseMapToDict = async <T, Res>(
  arr: T[],
  mapValue: (el: T, index?: number) => Res | Promise<Res>,
  mapKey: (el: T, index?: number) => string,
): Promise<Record<string, Res>> => {
  const mappedEntries = await Promise.all(arr.map(async (el, index) => [mapKey(el, index), await mapValue(el, index)]))

  return Object.fromEntries(mappedEntries)
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
