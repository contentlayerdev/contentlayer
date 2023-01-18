import type { Clock } from '@effect-ts/core/Effect/Clock'
import type { Has } from '@effect-ts/core/Has'

export { provideTestConsole, provideConsole } from './ConsoleService.js'
export type { HasConsole } from './ConsoleService.js'
export type { _A as OutputOf } from '@effect-ts/core/Utils'

export { pipe, flow, identity } from '@effect-ts/core/Function'
export { Tagged } from '@effect-ts/core/Case'
export type { Has } from '@effect-ts/core/Has'
export { tag } from '@effect-ts/core/Has'
export { pretty } from '@effect-ts/core/Effect/Cause'

export * as State from '@effect-ts/core/Effect/State'

export * as Stream from './Stream.js'
export * as S from './Stream.js'
export * as Effect from './Effect.js'
export * as T from './Effect.js'

export * as Branded from '@effect-ts/core/Branded'

export * as Sync from '@effect-ts/core/Sync'

export * as Tuple from '@effect-ts/core/Collections/Immutable/Tuple'
export * as Tp from '@effect-ts/core/Collections/Immutable/Tuple'

export * as HashMap from '@effect-ts/core/Collections/Immutable/HashMap'
export * as HashSet from '@effect-ts/core/Collections/Immutable/HashSet'

export * as Array from './Array.js'

export * as These from './These.js'

export * as Chunk from './Chunk.js'

export * as Cause from '@effect-ts/core/Effect/Cause'

export * as Clock from '@effect-ts/core/Effect/Clock'
export type HasClock = Has<Clock>

export * as Layer from '@effect-ts/core/Effect/Layer'
export * as L from '@effect-ts/core/Effect/Layer'

export * as Schedule from '@effect-ts/core/Effect/Schedule'
export * as SC from '@effect-ts/core/Effect/Schedule'

export * as Either from '@effect-ts/core/Either'
export * as E from '@effect-ts/core/Either'

export * as Option from './Option.js'
export * as O from './Option.js'

export * as Ex from '@effect-ts/core/Effect/Exit'

export * as H from '@effect-ts/core/Effect/Hub'

export * as M from '@effect-ts/core/Effect/Managed'

export * as Q from '@effect-ts/core/Effect/Queue'

export * as Ref from '@effect-ts/core/Effect/Ref'

export * as OT from './OT.js'
