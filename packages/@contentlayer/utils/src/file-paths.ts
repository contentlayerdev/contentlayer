import * as path from 'node:path'

import { Branded } from './effect/index.js'

export type AbsolutePosixFilePath = Branded.Branded<string, 'AbsolutePosixFilePath'>

export const absolutePosixFilePath = (path_: string): AbsolutePosixFilePath => {
  if (!isPosixFilePathString(path_)) {
    throw new Error(`Expected a Posix file path, got ${path_}`)
  }

  if (!path.isAbsolute(path_)) {
    throw new Error(`Expected an absolute path (i.e. starting with '/' or '\\'), got ${path_}`)
  }

  return Branded.makeBranded(path_)
}

export type RelativePosixFilePath = Branded.Branded<string, 'RelativePosixFilePath'>

export const relativePosixFilePath = (path_: string): RelativePosixFilePath => {
  if (!isPosixFilePathString(path_)) {
    throw new Error(`Expected a Posix file path, got ${path_}`)
  }

  if (path.isAbsolute(path_)) {
    throw new Error(`Expected a relative path (i.e. not starting with '/' or '\\'), got ${path_}`)
  }

  return Branded.makeBranded(path_)
}

export const isPosixFilePathString = (path_: string) => !path_.includes(path.win32.sep)
export const assertPosixFilePathString = (
  path_: string,
): asserts path_ is RelativePosixFilePath | AbsolutePosixFilePath => {
  if (!isPosixFilePathString(path_)) {
    throw new Error(`Expected a Posix file path, got ${path_}`)
  }
}

export const unknownToRelativePosixFilePath = (path_: string, cwd?: AbsolutePosixFilePath): RelativePosixFilePath => {
  if (path.isAbsolute(path_)) {
    if (cwd === undefined) {
      throw new Error(`Expected a relative path, got ${path_}`)
    }

    return relative(cwd, path_)
  }

  if (isPosixFilePathString(path_)) {
    return relativePosixFilePath(path_)
  }

  return relativePosixFilePath(path_.split(path.win32.sep).join(path.posix.sep))
}

export const unknownToAbsolutePosixFilePath = (path_: string, cwd?: AbsolutePosixFilePath): AbsolutePosixFilePath => {
  if (!path.isAbsolute(path_)) {
    if (cwd === undefined) {
      throw new Error(`Expected an absolute path (i.e. starting with '/' or '\\'), got ${path_}`)
    }

    return filePathJoin(cwd, path_)
  }

  if (isPosixFilePathString(path_)) {
    return absolutePosixFilePath(path_)
  }

  return absolutePosixFilePath(path_.split(path.win32.sep).join(path.posix.sep))
}

export type UnknownFilePath = Branded.Branded<string, 'UnknownFilePath'>

export const unknownFilePath = (path_: string): UnknownFilePath => Branded.makeBranded(path_)

export function filePathJoin(...paths: RelativePosixFilePath[]): RelativePosixFilePath
export function filePathJoin(...paths: [AbsolutePosixFilePath, ...string[]]): AbsolutePosixFilePath
export function filePathJoin(...paths: string[]): RelativePosixFilePath | AbsolutePosixFilePath {
  if (paths.length > 0 && path.isAbsolute(paths[0]!)) {
    if (paths.slice(1).some(path.isAbsolute)) {
      throw new Error(`All path segments except the first are expected to be relative, got ${paths}`)
    }

    return unknownToAbsolutePosixFilePath(path.join(...paths))
  }

  return unknownToRelativePosixFilePath(path.join(...paths))
}

export function dirname(path_: RelativePosixFilePath): RelativePosixFilePath
export function dirname(path_: AbsolutePosixFilePath): AbsolutePosixFilePath
export function dirname(
  path_: RelativePosixFilePath | AbsolutePosixFilePath,
): AbsolutePosixFilePath | RelativePosixFilePath {
  return path.dirname(path_) as AbsolutePosixFilePath | RelativePosixFilePath
}

export function relative(from: AbsolutePosixFilePath, to: AbsolutePosixFilePath): RelativePosixFilePath
export function relative(from: AbsolutePosixFilePath, to: string): RelativePosixFilePath
export function relative(
  from: AbsolutePosixFilePath | string,
  to: AbsolutePosixFilePath | string,
): RelativePosixFilePath {
  return unknownToRelativePosixFilePath(path.relative(from, to))
}
