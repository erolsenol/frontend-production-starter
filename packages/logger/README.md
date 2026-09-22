# `@repo/logger`

Small structured logging boundary for server code. Entries are JSON-shaped and common secret fields (`password`, `token`, `secret`, `authorization`, `cookie`) are redacted before reaching the sink.

```ts
const logger = createStructuredLogger((entry) => telemetry.send(entry));
logger.info("user invited", { requestId, userId });
```

Provide a production sink from the deployment/runtime integration; do not log credentials, cookies, or raw request bodies.
