# Documentation map

Frontend Production Starter is intentionally two products in one repository: a small starting point and a complete admin reference application. Use the shortest path that answers the current question.

## Start by intent

| Need | Read |
| --- | --- |
| Run the repo or choose an example | [Getting started](./getting-started.md) |
| Understand apps, packages, and dependency direction | [Architecture](./architecture.md) |
| Connect auth, PostgreSQL, email, rate limiting, or telemetry | [Production adapters](./production-adapters.md) |
| Configure environments, migrations, readiness, and release proof | [Operations](./operations.md) |
| Choose the right test command | [Testing](./testing.md) |
| Let an AI agent implement or review a change | [AI docs](./ai/README.md) |
| Understand why a major choice exists | [Architecture decisions](./decisions/README.md) |

## Examples

- `examples/minimal-next-app` is the five-minute starting point.
- `apps/admin` is the full admin reference: auth recovery, RBAC, users, roles, audit logs, health, rate limiting, and observability boundaries.
- `apps/docs` is a local visual index for the starter; the Markdown files in this folder remain the source of truth.

## Documentation rule

Document intent and boundaries here; let package manifests, scripts, types, and route files remain the source of truth for exact names and signatures. If a behavior changes, update the nearest guide and the relevant ADR or changelog entry in the same change.
