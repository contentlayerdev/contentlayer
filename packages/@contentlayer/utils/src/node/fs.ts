import { promises as fs } from 'fs'

export const fileOrDirExists = async (filePath: string): Promise<boolean> => {
  try {
    const stat = await fs.stat(filePath)
    return stat.isFile() || stat.isDirectory()
  } catch (e: any) {
    return false
  }
}
