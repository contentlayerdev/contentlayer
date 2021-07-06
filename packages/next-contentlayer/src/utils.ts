export const createOpenPromise = () => {
  let resolve: () => void
  return {
    promise: new Promise((resolve_: any) => {
      resolve = resolve_
    }),
    resolve: resolve!,
  }
}
