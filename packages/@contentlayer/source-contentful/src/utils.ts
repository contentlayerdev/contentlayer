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
