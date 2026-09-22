# Production adapter handoff

The starter ships with an optional production composition using Better Auth, Drizzle, PostgreSQL/Neon, and Upstash. The provider boundaries remain replaceable, while the public reference app stays demo-first by default and fails closed when `NODE_ENV=production` or `DEMO_MODE=false` without production configuration.

## Auth

The default production composition creates a Better Auth adapter from `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`. To replace it, implement the `AuthAdapter` contract from `@repo/auth` and compose it at the server boundary:

```ts
configureAdminAccess({
  auth: providerAuthAdapter,
  permissions: await providerPermissionsForSession(),
});
```

The adapter must read an httpOnly, secure, sameSite session and return a validated `Session`. Do not put access tokens in localStorage or expose provider secrets to client components.

## Data

The default production composition registers Drizzle repositories from `@repo/database`. They use SQL-side filtering/pagination and transactional multi-table creates. If you replace them, implement `UserRepository` and `RoleRepository` from `@repo/data-access`, validate inputs with the existing Zod schemas, and parameterize every query. Register both adapters with `configureUserRepository` and `configureRoleRepository` during server composition.

The in-memory repositories are only for local demo/test mode. They are not durable, multi-instance safe, or suitable for PII.

## Audit and rate limiting

The database schema includes `audit_log`; user and role mutations emit events with actor, resource, request ID, and redacted request context. `@repo/rate-limit-upstash` is used for production authentication and mutations when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are present. Missing rate-limit configuration fails closed in production with `503`; local demo/test bypasses it.

## Observability

`@repo/logger` remains the structured, redacting log boundary. `@repo/observability` exposes OpenTelemetry tracer/counter/histogram instruments without choosing an exporter. Register an OpenTelemetry SDK/exporter in the deployment runtime and keep secrets and PII out of attributes. The package is exporter-neutral so teams can use any OTLP-compatible backend.

## Deployment gate

- `GET /api/health` is liveness.
- `GET /api/health/ready` is readiness. In production it validates the required auth/database configuration and performs a lightweight PostgreSQL connectivity probe; it returns `503` when configuration or connectivity is unavailable.
- Run `pnpm verify` after connecting providers, then verify authenticated browser flows and database read/write behavior separately.
