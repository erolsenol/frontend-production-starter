# Operations and release proof

This starter separates local correctness, provider configuration, and public production proof. A successful build or static page is not evidence that auth, a database, email, rate limiting, or telemetry is working in a deployed environment.

## Production configuration

Set these server-side variables for the reference production composition:

| Variable | Purpose |
| --- | --- |
| `DEMO_MODE=false` | disables local demo auth/data |
| `AUTH_PROVIDER=better-auth` | selects Better Auth |
| `DATA_SOURCE=postgres` | selects Drizzle/PostgreSQL repositories |
| `DATABASE_URL` | PostgreSQL/Neon connection string |
| `BETTER_AUTH_SECRET` | at least 32 random characters |
| `BETTER_AUTH_URL` | canonical public admin URL |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | distributed rate limiting |
| `EMAIL_FROM`, `EMAIL_WEBHOOK_URL`, `EMAIL_WEBHOOK_TOKEN` | verification and password-reset delivery |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | optional OTLP traces and metrics |

Copy the names from `.env.example`; keep secrets out of `NEXT_PUBLIC_*`, git, logs, telemetry, and client components.

## Database lifecycle

Inspect the effective target before applying a migration:

```bash
pnpm db:generate
pnpm db:migrate
```

`db:migrate` is a state-changing operation. Run it only after confirming that `DATABASE_URL` points at the intended database and that the migration is reviewed. The local demo does not require a database.

## Health endpoints

- `GET /api/health` is liveness: the process can answer requests.
- `GET /api/health/ready` is readiness: production configuration is valid and a lightweight PostgreSQL connectivity probe succeeds.

Use readiness for deployment checks. A local `200` in demo mode is not production readiness evidence.

## Release gate

```bash
pnpm verify
```

After provider wiring, separately verify:

1. login, logout, email verification, and password reset with the real auth/email path;
2. authorized and unauthorized RBAC mutations;
3. durable user, role, and audit-log writes in the intended database;
4. rate-limit behavior across more than one process/instance;
5. readiness and public URL behavior;
6. traces/metrics arriving at the configured OTLP collector, when enabled.

For a deployed target, run `PRODUCTION_E2E_URL=https://admin.example.com pnpm e2e:production` with a dedicated non-production environment. Keep credentials and provider URLs in CI secrets, never in the repository.

Deployment examples for Vercel and Docker live in [`deploy/`](../deploy/README.md). They are starting points; the target platform’s runtime, secret store, domain, and database must still be verified separately.

Record those checks in the release notes or pull request. Do not describe local mocks as provider or deployment proof.
