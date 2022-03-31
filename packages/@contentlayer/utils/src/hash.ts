import { xxhash64 } from 'hash-wasm'
import type { JsonValue } from 'type-fest'

import { T, Tagged } from './effect/index.js'

export const hashObject = (obj: JsonValue | any): T.Effect<unknown, HashError, string> => {
  return T.tryCatchPromise(
    () => xxhash64(stringifyIfNeeded(obj)),
    (error) => new HashError({ error }),
  )
}

export class HashError extends Tagged('HashError')<{
  readonly error: unknown
}> {}

const stringifyIfNeeded = (_: JsonValue | any) => (typeof _ === 'string' ? _ : JSON.stringify(_))
