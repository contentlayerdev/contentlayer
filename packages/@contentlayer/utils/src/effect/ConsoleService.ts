import * as T from '@effect-ts/core/Effect'
import * as L from '@effect-ts/core/Effect/Layer'
import type { Has } from '@effect-ts/core/Has'
import { tag } from '@effect-ts/core/Has'
import type { _A } from '@effect-ts/core/Utils'

export const makeLiveConsole = T.succeedWith(() => ({
  log: (...msg: any[]) =>
    T.succeedWith(() => {
      console.log(...msg)
    }),
}))

export interface ConsoleService extends _A<typeof makeLiveConsole> {}

export const ConsoleService = tag<ConsoleService>()

export const LiveConsole = L.fromEffect(ConsoleService)(makeLiveConsole)

export const provideConsole = T.provideSomeLayer(LiveConsole)

export const { log } = T.deriveLifted(ConsoleService)(['log'], [], [])

export const provideTestConsole = (messages: any[]) =>
  T.provideServiceM(ConsoleService)(
    T.succeedWith(() => ({
      log: (message) =>
        T.succeedWith(() => {
          messages.push(message)
        }),
    })),
  )

export type HasConsole = Has<ConsoleService>
