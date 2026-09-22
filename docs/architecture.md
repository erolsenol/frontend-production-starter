# Architecture

Frontend Production Starter has three intentional layers:

```text
examples/minimal-next-app   five-minute onboarding path
apps/admin                  complete reference product and server composition
apps/docs                   local visual documentation index
        │
        ▼
packages/*                  contracts, capabilities, and provider boundaries
```

## Dependency direction

```text
route / Server Component
        ↓
feature query or action
        ↓
application composition
        ↓
repository / provider adapter
        ↓
typed contract + runtime validator
```

`apps/*` may consume `packages/*`. Packages do not import an app or a feature. Shared packages should remain framework-light unless their purpose is explicitly UI or layout. Product decisions belong in the app; stable vocabulary and replaceable capabilities belong in packages.

## Package roles

| Area | Packages | Responsibility |
| --- | --- | --- |
| Vocabulary | `types`, `contracts`, `validators`, `permissions` | shared types, domain contracts, input validation, RBAC model |
| UI | `ui`, `layout`, `design-tokens`, `tables`, `forms` | reusable presentation and interaction contracts |
| Boundary | `http`, `api-client`, `auth`, `data-access`, `database` | typed transport, auth/session, repositories, PostgreSQL implementation |
| Runtime | `logger`, `observability`, `email`, `rate-limit-upstash`, `feature-flags` | replaceable operational capabilities |
| Test/config | `testing`, `eslint-config`, `typescript-config` | workspace-wide tooling and test helpers |

Package manifests and exports are authoritative for the exact API. The table explains ownership and dependency direction, not every export.

## Admin reference composition

`apps/admin/lib/production-composition.ts` is the server-side composition root. It lazily wires Better Auth, Drizzle/PostgreSQL repositories, database-backed permission resolution, audit storage, optional Upstash rate limiting, and optional email delivery. The UI consumes contracts and does not know which provider implements them.

The default local composition is deliberately different: demo auth, in-memory repositories, and deterministic seed data. Runtime configuration rejects demo auth or memory data when `NODE_ENV=production` or a non-demo mode requests production behavior.

## Request and mutation path

```text
browser
  → Next route
  → request ID + origin check + rate limit
  → session/auth adapter
  → permission guard
  → Zod/runtime validation
  → repository transaction
  → audit event + redacted structured log
  → typed response
```

Protected actions check permissions in the rendered UI for discoverability and again at the mutation boundary for correctness. User and role mutations use SQL-side filtering/pagination and transactions where more than one table changes. Audit events preserve actor, resource, request ID, and redacted context.

## Operational boundaries

- `GET /api/health` is provider-independent liveness.
- `GET /api/health/ready` validates production configuration and probes PostgreSQL.
- `@repo/email` sends typed verification/reset messages through a server-side provider boundary.
- `@repo/observability` exposes OpenTelemetry instruments and starts an OTLP runtime only from the Node.js instrumentation hook when configured.
- `@repo/rate-limit-upstash` is the distributed production adapter; local demo mode does not pretend that an in-memory limit is multi-instance safe.

See [Production adapters](./production-adapters.md), [Operations](./operations.md), and the [ADRs](./decisions/README.md) for rationale and deployment responsibilities.
