import * as T from '@effect-ts/core/Effect'
import type { Clock } from '@effect-ts/core/Effect/Clock'
import type * as L from '@effect-ts/core/Effect/Layer'
import type { Has } from '@effect-ts/core/Has'
import * as OT from '@effect-ts/otel'
import { LiveSimpleProcessor, makeOTLPTraceExporterConfigLayer } from '@effect-ts/otel-exporter-trace-otlp-grpc'
import * as OTNode from '@effect-ts/otel-sdk-trace-node'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

//
// Jaeger Tracer (via Grpc Collector)
//

const makeNodeTracingProvider = (serviceName: string) =>
  OTNode.NodeProvider({
    resource: new Resource({ [SemanticResourceAttributes.SERVICE_NAME]: serviceName }),
  })

const CollectorConfig = makeOTLPTraceExporterConfigLayer({})

const makeJaegerNodeTracingLayer = (serviceName: string): L.Layer<Has<Clock>, never, OT.HasTracer> =>
  CollectorConfig['>+>'](OT.LiveTracer['<<<'](makeNodeTracingProvider(serviceName)['>+>'](LiveSimpleProcessor)))

export const provideJaegerTracing = (serviceName: string) => T.provideSomeLayer(makeJaegerNodeTracingLayer(serviceName))

// Only use Otel tracing if explicitly enabled via env var
export const provideTracing = (
  tracingServiceName: string,
  tracer: 'dummy' | 'otel' | 'based-on-env' = 'based-on-env',
) => {
  if (tracer === 'otel' || (tracer === 'based-on-env' && process.env.CL_OTEL !== undefined)) {
    return provideJaegerTracing(tracingServiceName)
  }

  return provideDummyTracing
}

//
// Dummy Tracer
//

// TODO change CLI entrypoints so this isn't needed
const dummyProps = {} as any
export const DummyTracing = OT.Tracer.has({
  [OT.TracerSymbol]: OT.TracerSymbol,
  tracer: {
    startSpan: () => ({
      setAttribute: () => null,
      setStatus: () => null,
      end: () => null,
    }),
    ...dummyProps,
  },
})

export const provideDummyTracing = T.provide(DummyTracing)
