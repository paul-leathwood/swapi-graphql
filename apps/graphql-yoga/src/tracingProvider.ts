import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

function createTracingProvider() {
  // api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.INFO);

  const tracingProvider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
    }),
  });

  // const traceExporter = new ConsoleSpanExporter();
  // tracingProvider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));

  const OTEL_EXPORTER_OTLP_TRACES_ENDPOINT =
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '';
  if (OTEL_EXPORTER_OTLP_TRACES_ENDPOINT.length > 0) {
    const traceExporter = new OTLPTraceExporter();
    tracingProvider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));
  }

  // Initialize the provider
  tracingProvider.register();

  return { tracingProvider };
}

export {
  createTracingProvider
};
