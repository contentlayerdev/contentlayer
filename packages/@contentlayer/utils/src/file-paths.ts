import * as path from 'node:path'

import { Branded } from './effect/index.js'

export type PosixFilePath = Branded.Branded<string, 'PosixFilePath'>

export const posixFilePath = (path_: string): PosixFilePath => {
  if (!isPosixFilePathString(path_)) {
    throw new Error(`Expected a Posix file path, got ${path_}`)
  }
  return Branded.makeBranded(path_)
}

export const isPosixFilePathString = (path_: string) => !path_.includes(path.win32.sep)
export const assertPosixFilePathString = (path_: string): asserts path_ is PosixFilePath => {
  if (!isPosixFilePathString(path_)) {
    throw new Error(`Expected a Posix file path, got ${path_}`)
  }
}

export const unknownToPosixFilePath = (path_: string): PosixFilePath => {
  if (isPosixFilePathString(path_)) {
    return posixFilePath(path_)
  }
  return posixFilePath(path_.split(path.win32.sep).join(path.posix.sep))
}

export type UnknownFilePath = Branded.Branded<string, 'UnknownFilePath'>

export const unknownFilePath = (path_: string): UnknownFilePath => Branded.makeBranded(path_)

export const filePathJoin = (...paths: string[]): PosixFilePath => unknownToPosixFilePath(path.join(...paths))
