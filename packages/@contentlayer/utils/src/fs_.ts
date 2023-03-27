import type { Stats } from 'node:fs'

import { Tagged } from '@effect-ts/core/Case'
import type { JsonValue } from 'type-fest'

import type { Has, OT } from './effect/index.js'
import { pipe, T, tag } from './effect/index.js'
import { errorToString } from './index.js'

export const FsTag = tag<Fs>(Symbol('contentlayer:Fs'))

export interface HasFs extends Has<Fs> {}

export const {
  fileOrDirExists,
  symlinkExists,
  stat,
  readFile,
  readFileBuffer,
  writeFile,
  writeFileJson,
  mkdirp,
  symlink,
} = T.deriveLifted(FsTag)(
  [
    'fileOrDirExists',
    'symlinkExists',
    'stat',
    'readFile',
    'readFileBuffer',
    'writeFile',
    'writeFileJson',
    'mkdirp',
    'symlink',
  ],
  [],
  [],
)

// NOTE the following functions can't be easily lifted
export const readFileJson = <T extends JsonValue = JsonValue>(
  filePath: string,
): T.Effect<OT.HasTracer & HasFs, ReadFileError | FileNotFoundError | JsonParseError, T> =>
  T.accessServiceM(FsTag)((_) => _.readFileJson<T>(filePath))

export const readFileJsonIfExists = <T extends JsonValue = JsonValue>(
  filePath: string,
): T.Effect<OT.HasTracer & HasFs, StatError | ReadFileError | JsonParseError, T | undefined> =>
  T.accessServiceM(FsTag)((_) => _.readFileJsonIfExists<T>(filePath))

export function rm(
  path: string,
  params: { force: true; recursive?: boolean },
): T.Effect<OT.HasTracer & HasFs, RmError, void>
export function rm(
  path: string,
  params?: { force?: false; recursive?: boolean },
): T.Effect<OT.HasTracer & HasFs, RmError | FileOrDirNotFoundError, void>

export function rm(
  path: string,
  params: { force?: boolean; recursive?: boolean } = {},
): T.Effect<OT.HasTracer & HasFs, RmError | FileOrDirNotFoundError, void> {
  return pipe(T.accessServiceM(FsTag)((_) => _.rm(path, params)))
}

export interface Fs {
  fileOrDirExists: (pathLike: string) => T.Effect<OT.HasTracer, StatError, boolean>
  symlinkExists: (pathLike: string) => T.Effect<unknown, StatError, boolean>
  stat: (filePath: string) => T.Effect<unknown, FileNotFoundError | StatError, Stats>
  readFile: (filePath: string) => T.Effect<OT.HasTracer, ReadFileError | FileNotFoundError, string>
  readFileBuffer: (filePath: string) => T.Effect<OT.HasTracer, ReadFileError | FileNotFoundError, Buffer>
  readFileJson: <T extends JsonValue = JsonValue>(
    filePath: string,
  ) => T.Effect<OT.HasTracer, ReadFileError | FileNotFoundError | JsonParseError, T>
  readFileJsonIfExists: <T extends JsonValue = JsonValue>(
    filePath: string,
  ) => T.Effect<OT.HasTracer, StatError | ReadFileError | JsonParseError, T | undefined>
  writeFile: (filePath: string, content: string) => T.Effect<OT.HasTracer, WriteFileError, void>
  writeFileJson: ({
    filePath,
    content,
  }: {
    filePath: string
    content: JsonValue
  }) => T.Effect<OT.HasTracer, WriteFileError | JsonStringifyError, void>
  mkdirp: <T extends string>(dirPath: T) => T.Effect<OT.HasTracer, MkdirError, void>

  rm(path: string, params: { force: true; recursive?: boolean }): T.Effect<OT.HasTracer, RmError, void>
  rm(
    path: string,
    params?: { force?: false; recursive?: boolean },
  ): T.Effect<OT.HasTracer, RmError | FileOrDirNotFoundError, void>
  rm(
    path: string,
    params: { force?: boolean; recursive?: boolean },
  ): T.Effect<OT.HasTracer, RmError | FileOrDirNotFoundError, void>

  symlink: ({
    targetPath,
    symlinkPath,
    type,
  }: {
    targetPath: string
    symlinkPath: string
    type: SymlinkType
  }) => T.Effect<OT.HasTracer, SymlinkError, void>
}

export type SymlinkType = 'file' | 'dir' | 'junction'

export class FileNotFoundError extends Tagged('fs.FileNotFoundError')<{ readonly filePath: string }> {}

export class FileOrDirNotFoundError extends Tagged('fs.FileOrDirNotFoundError')<{ readonly path: string }> {}

export class ReadFileError extends Tagged('fs.ReadFileError')<{
  readonly filePath: string
  readonly error: unknown
}> {}

export class StatError extends Tagged('fs.StatError')<{ readonly filePath: string; readonly error: unknown }> {}

export class WriteFileError extends Tagged('fs.WriteFileError')<{
  readonly filePath: string
  readonly error: unknown
}> {}

export class MkdirError extends Tagged('fs.MkdirError')<{ readonly dirPath: string; readonly error: unknown }> {}

export class RmError extends Tagged('fs.RmError')<{ readonly path: string; readonly error: unknown }> {}

export class SymlinkError extends Tagged('fs.SymlinkError')<{
  readonly targetPath: string
  readonly symlinkPath: string
  readonly type: SymlinkType
  readonly error: unknown
}> {}

export class UnknownFSError extends Tagged('fs.UnknownFSError')<{ readonly error: any }> {
  toString = () => `UnknownFSError: ${errorToString(this.error)} ${this.error.stack}`
}

export class JsonParseError extends Tagged('fs.JsonParseError')<{
  readonly str: string
  readonly error: unknown
}> {}

export class JsonStringifyError extends Tagged('fs.JsonStringifyError')<{ readonly error: unknown }> {}
