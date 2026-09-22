# Architecture

`apps/admin` owns routing, page composition, and product-specific features. Shared packages own stable contracts and reusable capabilities.

Start with `examples/minimal-next-app` for a small product. Add optional packages only when the product needs them. `apps/admin` is intentionally more complete and demonstrates how the same packages compose into a data-rich application.

```text
page / server component
        ↓
feature query or action
        ↓
repository / API adapter
        ↓
contracts + validators
```

Dependency rules:

- `@repo/contracts` has no UI or Next.js dependency.
- `@repo/ui` contains presentation only.
- `@repo/api-client` does not import the admin app.
- Features may consume shared packages; shared packages must not import features.
- Permission checks happen in both rendered actions and mutation boundaries.
- `@repo/ui` is presentation-only; feature code stays in an app or feature package.
- `@repo/http`, `@repo/auth`, and `@repo/logger` are adapter boundaries, not provider implementations.
- `@repo/data-access` owns repository interfaces and disposable reference adapters; application features depend on the interface rather than mock arrays or provider SDKs.
- `apps/admin/app/api/health/route.ts` is a provider-independent readiness endpoint; infrastructure can use it before adding deployment-specific checks.
- Admin API mutations use `x-request-id` correlation and reject a mismatching `Origin` when the browser provides one. Distributed rate limiting remains an infrastructure adapter concern and is intentionally not faked by the in-memory demo.
- `apps/admin/app/api/roles` is the reference vertical slice for Roles & Permissions: canonical permission catalog, runtime validation, repository boundary, protected API, and client UI.
- Runtime configuration rejects `DEMO_MODE=true`, `AUTH_PROVIDER=demo`, or `DATA_SOURCE=memory` when `NODE_ENV=production`.
- Keep mock data and demo auth behind replaceable adapters. Production integrations should validate environment variables, enforce permissions at mutation boundaries, and preserve the shared contracts.
- `apps/admin/lib/access.ts` exposes `createAdminPermissionGuard`; connect a real `AuthAdapter` there before enabling production routes. The default demo composition is denied in production.
