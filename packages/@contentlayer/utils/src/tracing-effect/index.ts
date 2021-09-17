import type { Clock } from '@effect-ts/core/Effect/Clock'
import type * as L from '@effect-ts/core/Effect/Layer'
import type { Has } from '@effect-ts/core/Has'
import * as OT from '@effect-ts/otel'

import { collectorConfig, LiveCollectorSimple } from './lib/otel-collector'
import { makeNodeTracingProvider } from './node-tracing-provider'

const CollectorConfig = collectorConfig({})

export const JaegerNodeTracing = (serviceName: string): L.Layer<Has<Clock>, never, OT.HasTracer> =>
  CollectorConfig['>+>'](OT.LiveTracer['<<<'](makeNodeTracingProvider(serviceName)['>+>'](LiveCollectorSimple)))
