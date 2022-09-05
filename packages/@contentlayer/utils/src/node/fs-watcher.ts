import type fs from 'node:fs'

import * as T from '@effect-ts/core/Effect'
import * as Ex from '@effect-ts/core/Effect/Exit'
import * as S from '@effect-ts/core/Effect/Experimental/Stream'
import * as H from '@effect-ts/core/Effect/Hub'
import * as M from '@effect-ts/core/Effect/Managed'
import * as Q from '@effect-ts/core/Effect/Queue'
import * as Ref from '@effect-ts/core/Effect/Ref'
import * as E from '@effect-ts/core/Either'
import { pipe } from '@effect-ts/core/Function'
import * as O from '@effect-ts/core/Option'
import * as Chokidar from 'chokidar'

import { Tagged } from '../effect/index.js'
import type { UnknownFilePath } from '../file-paths.js'
import { unknownFilePath } from '../file-paths.js'

export class FileAdded {
  readonly _tag = 'FileAdded'

  constructor(public path: UnknownFilePath, public stats: O.Option<fs.Stats>) {}
}

export class FileRemoved {
  readonly _tag = 'FileRemoved'

  constructor(public path: UnknownFilePath, public stats: O.Option<fs.Stats>) {}
}

export class FileChanged {
  readonly _tag = 'FileChanged'

  constructor(public path: UnknownFilePath, public stats: O.Option<fs.Stats>) {}
}

export class DirectoryAdded {
  readonly _tag = 'DirectoryAdded'

  constructor(public path: UnknownFilePath, public stats: O.Option<fs.Stats>) {}
}

export class DirectoryRemoved {
  readonly _tag = 'DirectoryRemoved'

  constructor(public path: UnknownFilePath, public stats: O.Option<fs.Stats>) {}
}

export type FileSystemEvent = FileAdded | FileRemoved | FileChanged | DirectoryAdded | DirectoryRemoved

export const FileWatcherTypeId = Symbol()
export type FileWatcherTypeId = typeof FileWatcherTypeId

export abstract class FileWatcher {
  readonly [FileWatcherTypeId]: FileWatcherTypeId = FileWatcherTypeId
}

abstract class FileWatcherInternal extends FileWatcher {
  readonly [FileWatcherTypeId]: FileWatcherTypeId = FileWatcherTypeId

  abstract shutdown(): T.UIO<void>

  abstract subscribe(): M.Managed<unknown, never, S.Stream<unknown, never, E.Either<FileWatcherError, FileSystemEvent>>>

  abstract add(paths: readonly string[]): T.UIO<void>

  abstract remove(paths: readonly string[]): T.UIO<void>
}

export const WatchErrorTypeId = Symbol()
export type WatchErrorTypeId = typeof WatchErrorTypeId

export class FileWatcherError extends Tagged('FileWatcherError')<{
  readonly origin: O.Option<unknown>
}> {
  readonly [WatchErrorTypeId]: WatchErrorTypeId = WatchErrorTypeId
}

class ConcreteFileWatcher extends FileWatcherInternal {
  readonly [FileWatcherTypeId]: FileWatcherTypeId = FileWatcherTypeId

  constructor(
    public instance: Ref.Ref<Chokidar.FSWatcher>,
    private fsEventsHub: H.Hub<Ex.Exit<never, E.Either<FileWatcherError, FileSystemEvent>>>,
    public readonly paths: readonly string[] | string,
    public readonly options?: Chokidar.WatchOptions,
  ) {
    super()
  }

  shutdown(): T.UIO<void> {
    return pipe(
      this.instance,
      Ref.get,
      T.chain((_) => T.tryPromise(() => _.close())),
      T.catchAll((_) => T.unit),
    )
  }

  add(paths: readonly string[]) {
    return pipe(
      this.instance,
      Ref.get,
      T.chain((_) =>
        T.succeedWith(() => {
          _.add(paths)
        }),
      ),
    )
  }

  remove(paths: readonly string[]) {
    return pipe(
      this.instance,
      Ref.get,
      T.chain((_) =>
        T.succeedWith(() => {
          _.unwatch(paths)
        }),
      ),
    )
  }

  subscribeToEvents() {
    return pipe(
      this.instance,
      Ref.get,
      T.chain((_) =>
        T.succeedWith(() => {
          _.on('error', (error) => {
            T.run(H.publish_(this.fsEventsHub, Ex.succeed(E.left(new FileWatcherError({ origin: O.some(error) })))))
          })
          _.on('all', (eventName, path, stats) => {
            switch (eventName) {
              case 'add':
                T.run(
                  H.publish_(
                    this.fsEventsHub,
                    Ex.succeed(E.right(new FileAdded(unknownFilePath(path), O.fromNullable(stats)))),
                  ),
                )
                break
              case 'unlink':
                T.run(
                  H.publish_(
                    this.fsEventsHub,
                    Ex.succeed(E.right(new FileRemoved(unknownFilePath(path), O.fromNullable(stats)))),
                  ),
                )
                break
              case 'change':
                T.run(
                  H.publish_(
                    this.fsEventsHub,
                    Ex.succeed(E.right(new FileChanged(unknownFilePath(path), O.fromNullable(stats)))),
                  ),
                )
                break
              case 'addDir':
                T.run(
                  H.publish_(
                    this.fsEventsHub,
                    Ex.succeed(E.right(new DirectoryAdded(unknownFilePath(path), O.fromNullable(stats)))),
                  ),
                )
                break
              case 'unlinkDir':
                T.run(
                  H.publish_(
                    this.fsEventsHub,
                    Ex.succeed(E.right(new DirectoryRemoved(unknownFilePath(path), O.fromNullable(stats)))),
                  ),
                )
                break
            }
          })
        }),
      ),
    )
  }

  subscribe(): M.Managed<unknown, never, S.Stream<unknown, never, E.Either<FileWatcherError, FileSystemEvent>>> {
    return pipe(
      H.subscribe(this.fsEventsHub),
      M.chain((_) => M.ensuringFirst_(M.succeed(S.fromQueue()(_)), Q.shutdown(_))),
      M.map(S.flattenExit),
    )
  }
}

function concrete(fileWatcher: FileWatcher): asserts fileWatcher is ConcreteFileWatcher {
  //
}

export function makeUnsafe(paths: readonly string[] | string, options?: Chokidar.WatchOptions): FileWatcher {
  const instance = Ref.unsafeMakeRef<Chokidar.FSWatcher>(Chokidar.watch(paths, options))
  const hub = H.unsafeMakeUnbounded<Ex.Exit<never, E.Either<FileWatcherError, FileSystemEvent>>>()

  return new ConcreteFileWatcher(instance, hub, paths, options)
}

// export function make(paths: readonly string[] | string, options?: Chokidar.WatchOptions): T.UIO<FileWatcher> {
//   console.log({ make: paths, options })

//   const x = Chokidar.watch(paths, options)

//   return pipe(
//     // T.succeedWith(() => Chokidar.watch(paths, options)),
//     T.succeedWith(() => console.log('start make')),
//     T.chain((_) => Ref.makeRef<Chokidar.FSWatcher>(x)),
//     // T.chain((_) => Ref.makeRef<Chokidar.FSWatcher>(_)),
//     // Ref.makeRef<Chokidar.FSWatcher>(x),
//     T.tap((_) => T.succeedWith(() => console.log({ ref: _ }))),
//     T.zip(H.makeUnbounded<Ex.Exit<never, E.Either<FileWatcherError, FileSystemEvent>>>()),
//     T.chain(({ tuple: [instance, hub] }) => {
//       console.log({ instance, hub })

//       return T.succeedWith(() => new ConcreteFileWatcher(instance, hub, paths, options))
//     }),
//     T.tap((_) => _.subscribeToEvents()),
//   )
// }

// export function make(paths: readonly string[] | string, options?: Chokidar.WatchOptions): T.UIO<FileWatcher> {
export function make(
  paths: readonly string[] | string,
  options?: Chokidar.WatchOptions,
): T.Effect<unknown, never, FileWatcher> {
  return pipe(
    T.succeedWith(() => Chokidar.watch(paths, options)),
    // T.tap(() => T.succeedWith(() => console.log('start make'))),
    T.chain((_) => Ref.makeRef<Chokidar.FSWatcher>(_)),
    T.zip(H.makeUnbounded<Ex.Exit<never, E.Either<FileWatcherError, FileSystemEvent>>>()),
    // T.tap(() => T.fail(new Error('test'))),
    T.chain(({ tuple: [instance, hub] }) =>
      T.succeedWith(() => new ConcreteFileWatcher(instance, hub, paths, options)),
    ),
    T.tap((_) => _.subscribeToEvents()),
  )
}

// export const makeAndSubscribe = (
//   paths: readonly string[] | string,
//   options?: Chokidar.WatchOptions,
// ): S.Stream<unknown, never, E.Either<FileWatcherError, FileSystemEvent>> =>
//   pipe(M.make_(make(paths, options), shutdown), M.chain(subscribe), S.unwrapManaged)

export const makeAndSubscribe = (
  paths: readonly string[] | string,
  options?: Chokidar.WatchOptions,
): S.Stream<unknown, never, E.Either<FileWatcherError, FileSystemEvent>> =>
  pipe(M.make_(make(paths, options), shutdown), M.chain(subscribe), S.unwrapManaged)

export function subscribe(
  self: FileWatcher,
): M.Managed<unknown, never, S.Stream<unknown, never, E.Either<FileWatcherError, FileSystemEvent>>> {
  concrete(self)

  return self.subscribe()
}

export function add_(self: FileWatcher, paths: readonly string[]): T.UIO<void> {
  concrete(self)

  return self.add(paths)
}

export function add(paths: readonly string[]) {
  return (self: FileWatcher) => add_(self, paths)
}

export function remove_(self: FileWatcher, paths: readonly string[]): T.UIO<void> {
  concrete(self)

  return self.remove(paths)
}

export function remove(paths: readonly string[]) {
  return (self: FileWatcher) => remove_(self, paths)
}

export function shutdown(self: FileWatcher): T.UIO<void> {
  concrete(self)

  return self.shutdown()
}
