import type * as core from '@contentlayer/core'
import { OT, pipe, T } from '@contentlayer/utils/effect'

export const provideNestedTypeDefMap = (): T.Effect<OT.HasTracer, unknown, core.NestedTypeDefMap> =>
  pipe(T.succeed({}), OT.withSpan('@contentlayer/source-notion/schema:provideNestedTypeDefMap'))
