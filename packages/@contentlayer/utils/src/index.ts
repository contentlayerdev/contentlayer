export * from './string.js'
export * from './guards.js'
export * from './object/index.js'
export * from './tracing.js'
export * from './promise.js'
export * from './hash.js'
export * from './single-item.js'
export * from './file-paths.js'
export * from './tracing-effect/index.js'

export { AsciiTree } from 'oo-ascii-tree'
export * as pattern from 'ts-pattern'
import { Tagged } from '@effect-ts/core/Case'
// inflection is a CJS module, so we need to import it as default export
import inflection from 'inflection'
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

export const errorToString = (error: any) => {
  const stack = process.env.CL_DEBUG ? error.stack : undefined
  const str = error.toString()
  const stackStr = stack ? `\n${stack}` : ''
  if (str !== '[object Object]') return str + stackStr

  return JSON.stringify({ ...error, stack }, null, 2)
}

export const capitalizeFirstLetter = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1)

/**
 * Use this to make assertion at end of if-else chain that all members of a
 * union have been accounted for.
 */
export function casesHandled(x: never): never {
  throw new Error(`A case was not handled for value: ${JSON.stringify(x)}`)
}

export type Thunk<T> = () => T

export const unwrapThunk = <T>(_: T | (() => T)): T => {
  if (typeof _ === 'function') {
    return (_ as any)()
  } else {
    return _
  }
}

export class RawError extends Tagged('RawError')<{ readonly error: unknown }> {}

export const isReadonlyArray = <T>(_: any): _ is ReadonlyArray<T> => Array.isArray(_)

export function assertNever(_: any): never {
  throw new Error(`assertNever: This should never happen ${JSON.stringify(_)}`)
}
