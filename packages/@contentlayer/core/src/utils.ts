import { promises as fs } from 'fs'
import * as path from 'path'

type ConvertUndefined<T> = OrUndefined<{ [K in keyof T as undefined extends T[K] ? K : never]-?: T[K] }>
type OrUndefined<T> = { [K in keyof T]: T[K] | undefined }
type PickRequired<T> = { [K in keyof T as undefined extends T[K] ? never : K]: T[K] }
type ConvertPick<T> = ConvertUndefined<T> & PickRequired<T>

export const pick = <Obj, Keys extends keyof Obj>(obj: Obj, keys: Keys[]): ConvertPick<{ [K in Keys]: Obj[K] }> => {
  return keys.reduce((acc, key) => {
    acc[key] = obj[key]
    return acc
  }, {} as any)
}

export const makeArtifactsDir = async (): Promise<string> => {
  const artifactsDirPath = path.join('node_modules', '.contentlayer')
  await fs.mkdir(artifactsDirPath, { recursive: true })

  return artifactsDirPath
}

export const fileExists = async (pathLike: string): Promise<boolean> => {
  try {
    const fileStat = await fs.stat(pathLike)
    return fileStat.isFile()
  } catch (_e) {
    return false
  }
}

export function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here")
}
