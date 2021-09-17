import { xxhash64 } from 'hash-wasm'
import type { JsonValue } from 'type-fest'

import { T, Tagged } from './effect'

export const hashObject = (obj: JsonValue): T.Effect<unknown, HashError, string> => {
  return T.tryCatchPromise(
    () => xxhash64(JSON.stringify(obj)),
    (error) => new HashError({ error }),
  )
}

export class HashError extends Tagged('HashError')<{
  readonly error: unknown
}> {}
