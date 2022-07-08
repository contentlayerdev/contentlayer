import { provideDummyTracing, provideJaegerTracing } from '@contentlayer/utils'
import { pipe, provideConsole, T } from '@contentlayer/utils/effect'
import type { _A, _E } from '@effect-ts/core/Utils'
import * as os from 'node:os'
import Pool from 'piscina'

import * as _ from './makeCacheItemFromFilePath.js'

type F = typeof _.makeCacheItemFromFilePath

export type Left<E, _> = { _tag: 'left'; value: E }
export type Right<_, A> = { _tag: 'right'; value: A }
export type Either<E, A> = Left<E, A> | Right<E, A>

type DTO = Either<_E<ReturnType<F>>, _A<ReturnType<F>>>

// FIXME: naming
export function fromWorkerPool(): F {
  const cores = os.cpus().length
  const pool = new Pool({
    // "Our testing has shown that a maxQueue size of approximately the square
    // of the maximum number of threads is generally sufficient and performs
    // well for many cases"
    //
    // via https://github.com/piscinajs/piscina#queue-size
    maxQueue: cores ** cores,
    // by default, this is cores * 1.5
    maxThreads: cores,
    // FIXME: get path dynamically
    filename:
      '/home/ts/dev/code/contentlayer/packages/@contentlayer/source-files/dist/fetchData/makeCacheItemFromFilePath.worker.js',
  })

  return (payload) =>
    pipe(
      // host -> worker
      T.succeedWith(() => JSON.stringify(payload, null, 2)),
      T.chain((value) => T.promise<string>(() => pool.run(value, { name: 'makeCacheItemFromFilePath' }))),
      // worker -> host
      T.chain((value) => T.succeedWith<DTO>(() => JSON.parse(value))),
      T.chain(({ _tag, value }) =>
        T.if_(
          _tag === 'right',
          () => T.succeedWith(() => value),
          // Signature claims it doesn't fail, so we're just dying here.
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
    provideJaegerTracing('worker'),
    T.runPromise,
    (p) => p.then((value) => JSON.stringify(value, null, 2)),
  )
}
