# ADR-0004: Optional OTLP telemetry and webhook email

## Status

Accepted

## Date

2026-09-22

## Context

Production teams need traces, metrics, email verification, and password recovery, but the starter must remain usable without a paid observability or email vendor and must not expose provider secrets to the browser.

## Decision

Expose OpenTelemetry instruments and an optional OTLP HTTP runtime from `@repo/observability`. Start it from the Node.js Next instrumentation hook only when `OTEL_EXPORTER_OTLP_ENDPOINT` is configured. Expose a typed `EmailSender` contract from `@repo/email` and deliver Better Auth verification/reset messages through a server-side webhook when configured.

## Alternatives considered

- **Hard-code one telemetry vendor:** easier first setup, but limits deployment choices.
- **Browser-only telemetry:** misses server and mutation boundaries and risks leaking sensitive attributes.
- **SMTP/vendor SDK in auth:** couples the auth package to credentials and a specific mail provider.

## Consequences

The default local run has no external side effects. Production operators must configure and verify the collector and email delivery path. Telemetry attributes and email payloads require deliberate redaction and server-only handling.
