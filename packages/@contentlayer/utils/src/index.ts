export * from './pick'

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
