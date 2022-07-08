import { provideDummyTracing } from '@contentlayer/utils'
import { pipe, provideConsole, T } from '@contentlayer/utils/effect'
import type { _A, _E } from '@effect-ts/core/Utils'
import Pool from 'piscina'

import * as _ from './makeCacheItemFromFilePath.js'

type F = typeof _.makeCacheItemFromFilePath

export type Left<E, A> = { _tag: 'left'; value: E }
export type Right<E, A> = { _tag: 'right'; value: A }
export type Either<E, A> = Left<E, A> | Right<E, A>

type DTO = Either<_E<ReturnType<F>>, _A<ReturnType<F>>>

// FIXME: naming
// This runs on the host, what is passed into the worker at `pool.run` has to
// be serializable.
export function fromWorkerPool(): F {
  // I believe, by default, #workers = #cpu cores, which is probably what we want?
  const pool = new Pool({
    // FIXME: get path dynamically
    filename:
      '/home/ts/dev/code/contentlayer/packages/@contentlayer/source-files/dist/fetchData/makeCacheItemFromFilePath.worker.js',
  })

  return (payload) =>
    pipe(
      T.succeedWith(() => JSON.stringify(payload)),
      T.chain((value) => T.promise<string>(() => pool.run(value, { name: 'makeCacheItemFromFilePath' }))),
      T.chain((value) => T.succeedWith<DTO>(() => JSON.parse(value))),
      T.chain(({ _tag, value }) =>
        T.if_(
          _tag === 'right',
          // FIXME: effect
          () => T.succeedWith(() => value),
          // FIXME: Signature claims it doesn't fail.
          () => T.die(value),
        ),
      ),
    )
}

// This runs IN THE WORKER, with the input coming via "wire" from the host.
// Since input and output cross a process boundary, input has to be de-serialized, output has to be serialized.
export function makeCacheItemFromFilePath(payload: string): Promise<string> {
  return pipe(
    T.succeedWith<Parameters<F>[0]>(() => JSON.parse(payload)),
    T.chain(_.makeCacheItemFromFilePath),
    T.fold(
      (value) => ({ _tag: 'left', value } as const),
      (value) => ({ _tag: 'right', value } as const),
    ),
    provideConsole,
    provideDummyTracing,
    T.runPromise,
    (p) => p.then((value) => JSON.stringify(value)),
  )
}
