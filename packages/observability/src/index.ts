import { metrics, SpanStatusCode, trace, type Counter, type Histogram, type Tracer } from "@opentelemetry/api";

export interface RequestTelemetry { readonly requestId: string; readonly route: string; readonly method: string; }
export interface Telemetry { readonly tracer: Tracer; readonly requestCounter: Counter; readonly requestDuration: Histogram; recordRequest(input: RequestTelemetry & { readonly status: number; readonly durationMs: number }): void; }

export const createTelemetry = (serviceName: string): Telemetry => {
  const meter = metrics.getMeter(serviceName);
  const tracer = trace.getTracer(serviceName);
  const requestCounter = meter.createCounter("http.server.requests", { description: "HTTP requests handled by the application." });
  const requestDuration = meter.createHistogram("http.server.duration", { unit: "ms", description: "HTTP request duration." });
  return { tracer, requestCounter, requestDuration, recordRequest(input) { const attributes = { route: input.route, method: input.method, status_code: input.status }; requestCounter.add(1, attributes); requestDuration.record(input.durationMs, attributes); const span = tracer.startSpan(input.route, { attributes: { ...attributes, request_id: input.requestId } }); span.setStatus({ code: input.status >= 500 ? SpanStatusCode.ERROR : SpanStatusCode.UNSET }); span.end(); } };
};
