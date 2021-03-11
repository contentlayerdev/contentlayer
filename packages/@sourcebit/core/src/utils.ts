export function pick<Obj, Keys extends keyof Obj>(obj: Obj, keys: Keys[]): { [K in Keys]: Obj[K] } {
  return keys.reduce((acc, key) => {
    acc[key] = obj[key]
    return acc
  }, {} as any)
}
