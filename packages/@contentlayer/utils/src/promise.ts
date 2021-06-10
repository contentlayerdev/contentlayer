/** Promise.all + Array.map */
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
