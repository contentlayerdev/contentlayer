import { pipe } from '@effect-ts/core'
import { Tagged } from '@effect-ts/core/Case'
import * as T from '@effect-ts/core/Effect'
import * as OT from '@effect-ts/otel'
import { promises as fs } from 'fs'
import type { JsonValue } from 'type-fest'

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

export const readFile = (filePath: string): T.Effect<OT.HasTracer, ReadFileError, string> =>
  OT.withSpan('readFile', { attributes: { filePath } })(
    T.tryCatchPromise(
      () => fs.readFile(filePath, 'utf8'),
      (error) => new ReadFileError({ filePath, error }),
    ),
  )

export const readFileJson = <T extends JsonValue = JsonValue>(
  filePath: string,
): T.Effect<OT.HasTracer, ReadFileError | JsonParseError, T> =>
  pipe(
    readFile(filePath),
    T.chain((str) =>
      T.tryCatch(
        () => JSON.parse(str) as T,
        (error) => new JsonParseError({ str, error }),
      ),
    ),
  )

export const writeFile = (filePath: string, content: string): T.Effect<OT.HasTracer, WriteFileError, void> =>
  OT.withSpan('writeFile', { attributes: { filePath } })(
    T.tryCatchPromise(
      () => fs.writeFile(filePath, content, 'utf8'),
      (error) => new WriteFileError({ filePath, error }),
    ),
  )

export const writeFileJson = ({
  filePath,
  content,
}: {
  filePath: string
  content: JsonValue
}): T.Effect<OT.HasTracer, WriteFileError | JsonStringifyError, void> =>
  pipe(
    T.tryCatch(
      () => JSON.stringify(content, null, 2) + '\n',
      (error) => new JsonStringifyError({ error }),
    ),
    T.chain((contentStr) => writeFile(filePath, contentStr)),
  )

export const mkdirp = (dirPath: string): T.Effect<OT.HasTracer, MkdirError, void> =>
  OT.withSpan('mkdirp', { attributes: { dirPath } })(
    T.tryCatchPromise(
      () => fs.mkdir(dirPath, { recursive: true }),
      (error) => new MkdirError({ dirPath, error }),
    ),
  )

export class ReadFileError extends Tagged('ReadFileError')<{ readonly filePath: string; readonly error: unknown }> {}
export class WriteFileError extends Tagged('WriteFileError')<{ readonly filePath: string; readonly error: unknown }> {}
export class MkdirError extends Tagged('MkdirError')<{ readonly dirPath: string; readonly error: unknown }> {}

export class JsonParseError extends Tagged('JsonParseError')<{ readonly str: string; readonly error: unknown }> {}
export class JsonStringifyError extends Tagged('JsonStringifyError')<{ readonly error: unknown }> {}
