export * from './fs'
export * from './guards'
export * from './pick'
export * from './promise'

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

export function assertUnreachable(_: never): never {
  throw new Error("Didn't expect to get here")
}

export const unwrapThunk = <T>(_: T | (() => T)): T => {
  if (typeof _ === 'function') {
    return (_ as any)()
  } else {
    return _
  }
}
