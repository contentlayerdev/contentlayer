import * as T from '@effect-ts/core/Effect'
import * as L from '@effect-ts/core/Effect/Layer'
import * as M from '@effect-ts/core/Effect/Managed'
import { pipe } from '@effect-ts/core/Function'
import type { Has } from '@effect-ts/core/Has'
import { tag } from '@effect-ts/core/Has'
import { SimpleProcessor } from '@effect-ts/otel'
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector'
import type { CollectorExporterConfigBase } from '@opentelemetry/exporter-collector/build/src/types'

export const CollectorTracingExporterConfigSymbol = Symbol()

export class CollectorTracingExporterConfig {
  readonly [CollectorTracingExporterConfigSymbol] = CollectorTracingExporterConfigSymbol
  constructor(readonly config: CollectorExporterConfigBase) {}
}

export const CollectorTracingExporterConfigTag = tag<CollectorTracingExporterConfig>()

export const collectorConfig = (
  config: CollectorExporterConfigBase,
): L.Layer<unknown, never, Has<CollectorTracingExporterConfig>> =>
  L.fromEffect(CollectorTracingExporterConfigTag)(
    T.succeedWith(() => new CollectorTracingExporterConfig(config)),
  ).setKey(CollectorTracingExporterConfigTag.key)

export const collectorConfigM = <R, E>(
  config: T.Effect<R, E, CollectorExporterConfigBase>,
): L.Layer<R, E, Has<CollectorTracingExporterConfig>> =>
  L.fromEffect(CollectorTracingExporterConfigTag)(T.map_(config, (_) => new CollectorTracingExporterConfig(_))).setKey(
    CollectorTracingExporterConfigTag.key,
  )

export const makeCollectorTracingSpanExporter = M.gen(function* (_) {
  const { config } = yield* _(CollectorTracingExporterConfigTag)

  const spanExporter = yield* _(
    pipe(
      T.succeedWith(() => new CollectorTraceExporter(config)),
      // NOTE Unfortunately this workaround/"hack" is currently needed since Otel doesn't yet provide a graceful
      // way to shutdown.
      //
      // Related issue: https://github.com/open-telemetry/opentelemetry-js/issues/987
      M.make((p) =>
        T.gen(function* (_) {
          while (1) {
            yield* _(T.sleep(0))
            const promises = p['_sendingPromises']
            if (promises.length > 0) {
              yield* _(T.result(T.promise(() => Promise.all(promises))))
            } else {
              break
            }
          }
        }),
      ),
    ),
  )

  return spanExporter
})

export const CollectorSimple = tag<SimpleProcessor<CollectorTraceExporter>>()

export const LiveCollectorSimple = SimpleProcessor(CollectorSimple, makeCollectorTracingSpanExporter)
