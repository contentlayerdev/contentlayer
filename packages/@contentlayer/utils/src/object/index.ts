export * from './pick.js'
export * from './omit.js'

type ValueOfRecord<R extends Record<any, any>> = R extends Record<any, infer V> ? V : never

export const mapObjectValues = <O_In extends Record<any, any>, V_Out>(
  obj: O_In,
  mapValue: (key: keyof O_In, val: ValueOfRecord<O_In>) => V_Out,
): { [K in keyof O_In]: V_Out } => {
  const mappedEntries = Object.entries(obj).map(([key, val]) => [key, mapValue(key as keyof O_In, val)] as const)
  return Object.fromEntries(mappedEntries) as any
}
