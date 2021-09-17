import { pipe } from '@effect-ts/core'
import { Tagged } from '@effect-ts/core/Case'
import * as T from '@effect-ts/core/Effect'
import * as OT from '@effect-ts/otel'
import type { Stats } from 'fs'
import { promises as fs } from 'fs'
import type { JsonValue } from 'type-fest'

import { errorToString } from '..'

export const fileOrDirExists = (filePath: string): T.Effect<unknown, StatError, boolean> => {
  return pipe(
    stat(filePath),
    T.map((stat_) => stat_.isFile() || stat_.isDirectory()),
    T.catchTag('node.fs.FileNotFoundError', () => T.succeed(false)),
  )
}

export const stat = (filePath: string): T.Effect<unknown, FileNotFoundError | StatError, Stats> => {
  return T.tryCatchPromise(
    async () => fs.stat(filePath),
    (error: any) => {
      if (error.code === 'ENOENT') {
        return new FileNotFoundError({ filePath })
      } else {
        return new StatError({ filePath, error })
      }
    },
  )
}

export const readFile = (filePath: string): T.Effect<OT.HasTracer, ReadFileError | FileNotFoundError, string> =>
  OT.withSpan('readFile', { attributes: { filePath } })(
    T.tryCatchPromise(
      () => fs.readFile(filePath, 'utf8'),
      (error: any) => {
        if (error.code === 'ENOENT') {
          return new FileNotFoundError({ filePath })
        } else {
          return new ReadFileError({ filePath, error })
        }
      },
    ),
  )

export const readFileJson = <T extends JsonValue = JsonValue>(
  filePath: string,
): T.Effect<OT.HasTracer, ReadFileError | FileNotFoundError | JsonParseError, T> =>
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

export class FileNotFoundError extends Tagged('node.fs.FileNotFoundError')<{ readonly filePath: string }> {}

export class ReadFileError extends Tagged('node.fs.ReadFileError')<{
  readonly filePath: string
  readonly error: unknown
}> {}

export class StatError extends Tagged('node.fs.StatError')<{ readonly filePath: string; readonly error: unknown }> {}

export class WriteFileError extends Tagged('node.fs.WriteFileError')<{
  readonly filePath: string
  readonly error: unknown
}> {}

export class MkdirError extends Tagged('node.fs.MkdirError')<{ readonly dirPath: string; readonly error: unknown }> {}

export class UnknownFSError extends Tagged('node.fs.UnknownFSError')<{ readonly error: any }> {
  toString = () => `UnknownFSError: ${errorToString(this.error)} ${this.error.stack}`
}

export class JsonParseError extends Tagged('node.fs.JsonParseError')<{
  readonly str: string
  readonly error: unknown
}> {}

export class JsonStringifyError extends Tagged('node.fs.JsonStringifyError')<{ readonly error: unknown }> {}
