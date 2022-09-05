import type { Stats } from 'node:fs'
import { promises as fs } from 'node:fs'

import { pipe } from '@effect-ts/core'
import { Tagged } from '@effect-ts/core/Case'
import * as OT from '@effect-ts/otel'
import type { JsonValue } from 'type-fest'

import { T } from '../effect/index.js'
import { errorToString } from '../index.js'

export const fileOrDirExists = (pathLike: string): T.Effect<OT.HasTracer, StatError, boolean> => {
  return pipe(
    stat(pathLike),
    T.map((stat_) => stat_.isFile() || stat_.isDirectory()),
    T.catchTag('node.fs.FileNotFoundError', () => T.succeed(false)),
    T.tap((exists) => OT.addAttribute('exists', exists)),
    OT.withSpan('fileOrDirExists', { attributes: { pathLike } }),
  )
}

export const symlinkExists = (pathLike: string): T.Effect<unknown, StatError, boolean> => {
  return pipe(
    stat(pathLike),
    T.map((stat_) => stat_.isSymbolicLink()),
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

export const readFileBuffer = (filePath: string): T.Effect<OT.HasTracer, ReadFileError | FileNotFoundError, Buffer> =>
  OT.withSpan('readFileBuffer', { attributes: { filePath } })(
    T.tryCatchPromise(
      () => fs.readFile(filePath),
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

export const readFileJsonIfExists = <T extends JsonValue = JsonValue>(
  filePath: string,
): T.Effect<OT.HasTracer, StatError | ReadFileError | JsonParseError, T | undefined> =>
  pipe(
    fileOrDirExists(filePath),
    T.chain((exists) => (exists ? readFileJson<T>(filePath) : T.succeed(undefined))),
    T.catchTag('node.fs.FileNotFoundError', (e) => T.die(e)),
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

export const mkdirp = <T extends string>(dirPath: T): T.Effect<OT.HasTracer, MkdirError, void> =>
  OT.withSpan('mkdirp', { attributes: { dirPath } })(
    T.tryCatchPromise(
      () => fs.mkdir(dirPath, { recursive: true }),
      (error) => new MkdirError({ dirPath, error }),
    ),
  )

export function rm(path: string, params: { force: true; recursive?: boolean }): T.Effect<OT.HasTracer, RmError, void>
export function rm(
  path: string,
  params?: { force?: false; recursive?: boolean },
): T.Effect<OT.HasTracer, RmError | FileOrDirNotFoundError, void>

export function rm(
  path: string,
  params: { force?: boolean; recursive?: boolean } = {},
): T.Effect<OT.HasTracer, RmError | FileOrDirNotFoundError, void> {
  const { force = false, recursive = true } = params
  return OT.withSpan('rm', { attributes: { path } })(
    T.tryCatchPromise(
      () => fs.rm(path, { recursive, force }),
      (error: any) => {
        if (error.code === 'ENOENT') {
          return new FileOrDirNotFoundError({ path })
        } else {
          return new RmError({ path, error })
        }
      },
    ),
  )
}

export type SymlinkType = 'file' | 'dir' | 'junction'

/**
 * NOTE: symlinks are not supported widely on Windows
 */
export const symlink = ({
  targetPath,
  symlinkPath,
  type,
}: {
  targetPath: string
  symlinkPath: string
  type: SymlinkType
}): T.Effect<OT.HasTracer, SymlinkError, void> =>
  OT.withSpan('symlink', { attributes: { targetPath, symlinkPath, type } })(
    T.tryCatchPromise(
      () => fs.symlink(targetPath, symlinkPath, type),
      (error) => new SymlinkError({ targetPath, symlinkPath, type, error }),
    ),
  )

export class FileNotFoundError extends Tagged('node.fs.FileNotFoundError')<{ readonly filePath: string }> {}

export class FileOrDirNotFoundError extends Tagged('node.fs.FileOrDirNotFoundError')<{ readonly path: string }> {}

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

export class RmError extends Tagged('node.fs.RmError')<{ readonly path: string; readonly error: unknown }> {}

export class SymlinkError extends Tagged('node.fs.SymlinkError')<{
  readonly targetPath: string
  readonly symlinkPath: string
  readonly type: SymlinkType
  readonly error: unknown
}> {}

export class UnknownFSError extends Tagged('node.fs.UnknownFSError')<{ readonly error: any }> {
  toString = () => `UnknownFSError: ${errorToString(this.error)} ${this.error.stack}`
}

export class JsonParseError extends Tagged('node.fs.JsonParseError')<{
  readonly str: string
  readonly error: unknown
}> {}

export class JsonStringifyError extends Tagged('node.fs.JsonStringifyError')<{ readonly error: unknown }> {}
