export * from './string'
export * from './guards'
export * from './object'
export * from './tracing'
export * from './promise'
export * from './rxjs'
export * as effectUtils from './effect'
export * from './pipe'
export * from './flow'
export * from './tracing-effect'

import './global'

export * as pattern from 'ts-pattern'
import * as inflection from 'inflection'
export { inflection }

export const recRemoveUndefinedValues = (val: any): void => {
  if (Array.isArray(val)) {
    val.forEach(recRemoveUndefinedValues)
  } else if (typeof val === 'object') {
    Object.keys(val).forEach((key) => {
      if (val[key] === undefined) {
        delete val[key]
      } else {
        recRemoveUndefinedValues(val[key])
      }
    })
  }
}

export const partition = <T>(arr: T[], isLeft: (_: T) => boolean): [T[], T[]] => {
  return arr.reduce(
    (acc, el) => {
      if (isLeft(el)) {
        acc[0].push(el)
      } else {
        acc[1].push(el)
      }
      return acc
    },
    [[], []] as [T[], T[]],
  )
}

/**
 * Use this to make assertion at end of if-else chain that all members of a
 * union have been accounted for.
 */
export function casesHandled(x: never): never {
  throw new Error(`A case was not handled for value: ${JSON.stringify(x)}`)
}

export const unwrapThunk = <T>(_: T | (() => T)): T => {
  if (typeof _ === 'function') {
    return (_ as any)()
  } else {
    return _
  }
}
