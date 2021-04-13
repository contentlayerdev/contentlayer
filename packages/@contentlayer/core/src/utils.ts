import { promises as fs } from 'fs'
import * as path from 'path'

export const pick = <Obj, Keys extends keyof Obj>(obj: Obj, keys: Keys[]): { [K in Keys]: Obj[K] } => {
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
