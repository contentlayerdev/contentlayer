import type { Stats } from 'node:fs'

import { fs } from 'memfs'
import type { JsonValue } from 'type-fest'

import { L, OT, pipe, T } from './effect/index.js'
import type { SymlinkType } from './fs_.js'
import {
  FileNotFoundError,
  FileOrDirNotFoundError,
  FsTag,
  JsonParseError,
  JsonStringifyError,
  MkdirError,
  ReadFileError,
  RmError,
  StatError,
  SymlinkError,
  WriteFileError,
} from './fs_.js'

export const fileOrDirExists = (pathLike: string): T.Effect<OT.HasTracer, StatError, boolean> => {
  return pipe(
    stat(pathLike),
    T.map((stat_) => stat_.isFile() || stat_.isDirectory()),
    T.catchTag('fs.FileNotFoundError', () => T.succeed(false)),
    T.tap((exists) => OT.addAttribute('exists', exists)),
    OT.withSpan('fileOrDirExists', { attributes: { pathLike } }),
  )
}

export const symlinkExists = (pathLike: string): T.Effect<unknown, StatError, boolean> => {
  return pipe(
    stat(pathLike),
    T.map((stat_) => stat_.isSymbolicLink()),
    T.catchTag('fs.FileNotFoundError', () => T.succeed(false)),
  )
}

export const stat = (filePath: string): T.Effect<unknown, FileNotFoundError | StatError, Stats> => {
  return T.tryCatch(
    () => fs.statSync(filePath),
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
    T.tryCatch(
      () => fs.readFileSync(filePath, 'utf8') as string,
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
    T.tryCatch(
      () => fs.readFileSync(filePath, { encoding: 'buffer' }) as Buffer,
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
    T.catchTag('fs.FileNotFoundError', (e) => T.die(e)),
  )

export const writeFile = (filePath: string, content: string): T.Effect<OT.HasTracer, WriteFileError, void> =>
  OT.withSpan('writeFile', { attributes: { filePath } })(
    T.tryCatch(
      () => fs.writeFileSync(filePath, content, { encoding: 'utf8' }),
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
    T.tryCatch(
      () => fs.mkdirpSync(dirPath),
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
    T.tryCatch(
      () => fs.rmSync(path, { recursive, force }),
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
    T.tryCatch(
      () => fs.symlinkSync(targetPath, symlinkPath, type),
      (error) => new SymlinkError({ targetPath, symlinkPath, type, error }),
    ),
  )

export const InMemoryFsLive = L.fromValue(FsTag)({
  fileOrDirExists,
  symlinkExists,
  stat,
  readFile,
  readFileBuffer,
  readFileJson,
  readFileJsonIfExists,
  writeFile,
  writeFileJson,
  mkdirp,
  rm,
  symlink,
})
