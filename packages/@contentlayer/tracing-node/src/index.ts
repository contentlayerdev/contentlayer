import { CollectorTraceExporter } from '@opentelemetry/exporter-collector'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { NodeTracerProvider } from '@opentelemetry/node'
import { Resource } from '@opentelemetry/resources'
import { ResourceAttributes } from '@opentelemetry/semantic-conventions'
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing'

const init = () => {
  const env = getEnv()
  if (!env.enableCollector && !env.enableConsole) return

  const provider = new NodeTracerProvider({
    resource: new Resource({
      [ResourceAttributes.SERVICE_NAME]: 'contentlayer',
    }),
  })

  if (env.enableConsole) {
    provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()))
  }

  if (env.enableCollector) {
    const exporter = new CollectorTraceExporter()
    provider.addSpanProcessor(new SimpleSpanProcessor(exporter))
  }

  provider.register()

  registerInstrumentations({
    instrumentations: [new HttpInstrumentation()],
  })
}

type Env = { enableCollector: boolean; enableConsole: boolean }
const getEnv = (): Env => {
  const env = process.env['CONTENTLAYER_TRACING']
  const enableCollector = env?.includes('collector') ?? false
  const enableConsole = env?.includes('console') ?? false
  return { enableCollector, enableConsole }
}

init()
