import { CollectorTraceExporter } from '@opentelemetry/exporter-collector'
// import { JaegerExporter } from '@opentelemetry/exporter-jaeger'
import { NodeTracerProvider } from '@opentelemetry/node'
import { Resource } from '@opentelemetry/resources'
import { ResourceAttributes } from '@opentelemetry/semantic-conventions'
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing'

const provider = new NodeTracerProvider({
  resource: new Resource({
    [ResourceAttributes.SERVICE_NAME]: 'contentlayer',
  }),
})

if (process.env['TRACING_CONSOLE']) {
  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()))
}

export const exporter = new CollectorTraceExporter()
provider.addSpanProcessor(new SimpleSpanProcessor(exporter))

provider.register()
