# Package catalog

Reusable code lives in `packages/*`; application routing and product-specific orchestration live in `apps/*`.

| Package | Use it for |
| --- | --- |
| `@repo/api-client` | typed feature-facing API calls |
| `@repo/auth` | session contracts, guards, and Better Auth adapter |
| `@repo/config` | validated runtime configuration and production fail-closed rules |
| `@repo/contracts` | framework-light domain types |
| `@repo/data-access` | repository interfaces and demo adapters |
| `@repo/database` | Drizzle PostgreSQL schema, migrations, and repositories |
| `@repo/design-tokens` | shared visual tokens |
| `@repo/email` | provider-neutral verification/reset email delivery |
| `@repo/feature-flags` | typed feature flag contracts |
| `@repo/forms` | form state contracts |
| `@repo/http` | typed HTTP transport and errors |
| `@repo/i18n` | locale contracts |
| `@repo/layout` | reusable page layout primitives |
| `@repo/logger` | structured redacting logs |
| `@repo/notifications` | notification contracts |
| `@repo/observability` | OpenTelemetry instruments and OTLP runtime |
| `@repo/permissions` | canonical RBAC permission model |
| `@repo/rate-limit-upstash` | distributed Upstash rate limiting |
| `@repo/tables` | sortable/filterable table contracts |
| `@repo/testing` | shared test helpers |
| `@repo/types` | framework-neutral utility types |
| `@repo/ui` | accessible presentation primitives |
| `@repo/validation` / `@repo/validators` | runtime validation contracts and schemas |

Read the package README for a public API example. If a package is missing a focused example, add it with the same change that expands its public surface.
