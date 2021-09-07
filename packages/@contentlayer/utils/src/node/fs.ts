import { pipe } from '@effect-ts/core'
import * as T from '@effect-ts/core/Effect'
import { promises as fs } from 'fs'

export const fileOrDirExists = async (filePath: string): Promise<boolean> => {
  try {
    const stat = await fs.stat(filePath)
    return stat.isFile() || stat.isDirectory()
  } catch (e: any) {
    return false
  }
}

export const fileOrDirExistsEff = (filePath: string): T.Effect<unknown, never, boolean> => {
  return pipe(
    T.tryPromise(async () => {
      const stat = await fs.stat(filePath)
      return stat.isFile() || stat.isDirectory()
    }),
    T.catchAll(() => T.succeed(false)),
  )
}
