import type { PosixFilePath } from '@contentlayer/utils'
import { filePathJoin } from '@contentlayer/utils'
import { Chunk, O, pipe, T, Tagged } from '@contentlayer/utils/effect'
import { fs } from '@contentlayer/utils/node'
import { parse as parseJsonc } from 'comment-json'

import { getCwd } from './cwd.js'

export const validateTsconfig = T.gen(function* ($) {
  const cwd = yield* $(getCwd)

  const possibleFileNames = ['tsconfig.json', 'jsconfig.json'].map((_) => filePathJoin(cwd, _))

  // const x = yield* $(
  //   pipe(possibleFileNames.map((_) => tryParseFile(_)) as [TryParseFileEffect, TryParseFileEffect], T.raceAll),
  // )

  const tsconfigOption = yield* $(
    pipe(
      possibleFileNames,
      T.forEachPar(tryParseFile),
      T.map(Chunk.toArray),
      T.map((_) => O.getFirst(..._)),
    ),
  )

  if (O.isNone(tsconfigOption)) {
    yield* $(
      T.log(
        `Contentlayer: No tsconfig.json (or jsconfig.json) file found. Importing from \`contentlayer\/generated\` will not work.`,
      ),
    )

    return
  }

  const tsconfig: any = tsconfigOption.value

  if (tsconfig.baseUrl === undefined) {
    yield* $(
      T.log(
        `Contentlayer: tsconfig.json does not have a baseUrl. Importing from \`contentlayer\/generated\` will not work.`,
      ),
    )
  }
})

const tryParseFile = (filePath: PosixFilePath) =>
  pipe(
    fs.readFile(filePath),
    T.chain((contents) =>
      T.tryCatch(
        () => parseJsonc(contents, undefined, true),
        (error) => new InvalidTsconfigError({ error }),
      ),
    ),
    T.mapError((_) => (_._tag === 'node.fs.ReadFileError' ? new InvalidTsconfigError({ error: _ }) : _)),
    T.tapError((error) =>
      T.succeedWith(() => {
        if (error._tag === 'InvalidTsconfigError') {
          console.log(`Contentlayer: Invalid jsconfig/tsconfig file found: ${filePath}`)
        }
      }),
    ),
    T.option,
  )

export class InvalidTsconfigError extends Tagged('InvalidTsconfigError')<{ readonly error: any }> {}
