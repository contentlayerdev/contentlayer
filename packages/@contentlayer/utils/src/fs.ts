import { promises as fs } from 'fs'

export const fileExists = async (pathLike: string): Promise<boolean> => {
  try {
    const fileStat = await fs.stat(pathLike)
    return fileStat.isFile()
  } catch (_e) {
    return false
  }
}
