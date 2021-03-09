import { promises as fs } from 'fs'

export function pick<Obj, Keys extends keyof Obj>(obj: Obj, keys: Keys[]): { [K in Keys]: Obj[K] } {
  return keys.reduce((acc, key) => {
    acc[key] = obj[key]
    return acc
  }, {} as any)
}

export async function fileExists(pathLike: string): Promise<boolean> {
  try {
    const fileStat = await fs.stat(pathLike)
    return fileStat.isFile()
  } catch (_e) {
    return false
  }
}

export function unwrapThunk<T>(_: T | (() => T)): T {
  if (typeof _ === 'function') {
    return (_ as any)()
  } else {
    return _
  }
}
