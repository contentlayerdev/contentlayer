type ConvertUndefined<T> = OrUndefined<{ [K in keyof T as undefined extends T[K] ? K : never]-?: T[K] }>
type OrUndefined<T> = { [K in keyof T]: T[K] | undefined }
type PickRequired<T> = { [K in keyof T as undefined extends T[K] ? never : K]: T[K] }
type ConvertPick<T> = ConvertUndefined<T> & PickRequired<T>

export const pick = <Obj, Keys extends keyof Obj>(
  obj: Obj,
  keys: Keys[],
  /** Whether to filter out explicit `undefined` values */
  filterUndefined = true,
): ConvertPick<{ [K in Keys]: Obj[K] }> => {
  return keys.reduce((acc, key) => {
    const val = obj[key]
    if (val === undefined && filterUndefined) return acc

    acc[key] = val

    return acc
  }, {} as any)
}
