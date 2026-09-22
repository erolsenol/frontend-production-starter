export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.OTEL_EXPORTER_OTLP_ENDPOINT) return;
  const { createTelemetryRuntime } = await import("@repo/observability");
  const runtime = createTelemetryRuntime({ endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT, serviceName: "frontend-production-starter-admin" });
  await runtime.start();
}
