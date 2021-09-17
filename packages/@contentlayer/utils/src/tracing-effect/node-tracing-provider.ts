import type * as L from '@effect-ts/core/Effect/Layer'
import type { Has } from '@effect-ts/core/Has'
import type * as OT from '@effect-ts/otel'
import * as OTNode from '@effect-ts/otel-node'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

export const makeNodeTracingProvider = (serviceName: string): L.Layer<unknown, never, Has<OT.TracerProvider>> =>
  OTNode.NodeProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
  })
