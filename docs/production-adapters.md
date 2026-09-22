# Production adapter handoff

The public starter is demo-first but includes a replaceable production composition. The default reference uses Better Auth, Drizzle/PostgreSQL or Neon, Upstash, a webhook email sender, and an OTLP-compatible collector. The contracts are intentionally vendor-neutral.

## Auth

Configure `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` for the Better Auth composition. If another identity provider is required, implement `AuthAdapter` from `@repo/auth` and compose it at the server boundary. The adapter must return a validated session from a secure, httpOnly, sameSite cookie or equivalent server-side mechanism.

Auth recovery uses `@repo/email` when `EMAIL_WEBHOOK_URL` is configured. The webhook receives a typed `EmailMessage` for verification and password-reset links; SMTP, Resend, Postmark, or an internal mail service can implement that boundary without changing the auth package.

## Data and RBAC

Implement `UserRepository` and `RoleRepository` from `@repo/data-access` when replacing the database adapter. Validate inputs with the existing schemas and parameterize queries. Register adapters in the server composition, not in client components.

The PostgreSQL reference resolves permissions through `user_role` and `role_permission`, performs filtering/pagination in SQL, and uses transactions for multi-table writes. The in-memory adapter is disposable demo/test infrastructure and is not durable or multi-instance safe.

## Audit and rate limiting

Mutation routes emit audit events with actor, resource, request ID, and redacted request context. Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for distributed auth and mutation rate limiting. Missing production rate-limit configuration fails closed with `503`; local demo/test mode may bypass the external adapter.

## Observability

`@repo/logger` is the structured, redacting log boundary. `@repo/observability` exposes OpenTelemetry tracer/counter/histogram instruments and an optional OTLP HTTP runtime. Set `OTEL_EXPORTER_OTLP_ENDPOINT` to start the Node.js SDK during Next instrumentation. Keep tokens, passwords, cookies, email addresses, and sensitive request bodies out of attributes.

## Handoff checklist

1. Copy `.env.example` and set server-only production values.
2. Verify the effective database target before `pnpm db:migrate`.
3. Run `pnpm verify`.
4. Verify real login, recovery email, RBAC denial/allow, durable audit writes, rate limiting, readiness, and telemetry separately.

See [Operations](./operations.md) for the distinction between local test evidence and public production proof.
