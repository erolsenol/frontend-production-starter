# `@repo/observability`

OpenTelemetry instruments plus an optional OTLP HTTP runtime.

```ts
import { createTelemetry } from "@repo/observability";

const telemetry = createTelemetry("admin");
telemetry.requestCounter.add(1, { operation: "users.list" });
```

Start `createTelemetryRuntime` only from a server/Node instrumentation hook and keep secrets, cookies, tokens, and PII out of attributes.
