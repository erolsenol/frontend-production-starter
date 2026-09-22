# ADR-0002: Provider-neutral production composition

## Status

Accepted

## Date

2026-09-22

## Context

The starter needs a runnable demo without credentials and a credible path to production. Coupling feature components directly to an auth, database, email, or rate-limit vendor would make the reference app harder to reuse.

## Decision

Define typed adapter boundaries and compose providers at the server edge. Demo auth and in-memory repositories are the local default. The reference production composition uses Better Auth, Drizzle/PostgreSQL, Upstash, and a provider-neutral email webhook; OpenTelemetry exports through OTLP when configured.

## Alternatives considered

- **Vendor SDKs in features:** fast for one product, but spreads secrets and makes replacement costly.
- **Production-only local setup:** realistic, but creates a credential and infrastructure barrier for the first five minutes.
- **Multiple vendor implementations in shared packages:** broadens the starter and couples its release cycle to providers.

## Consequences

Local demo behavior stays deterministic. Production configuration is more explicit and fails closed. Provider integration and public deployment must be verified separately from unit tests and static builds.
