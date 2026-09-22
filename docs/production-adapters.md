# Production adapter handoff

The starter deliberately does not choose an auth vendor or database vendor. The public reference app is mock-first, but it fails closed when `NODE_ENV=production` or `DEMO_MODE=false`.

## Auth

Implement the `AuthAdapter` contract from `@repo/auth`, then compose it at the server boundary:

```ts
configureAdminAccess({
  auth: providerAuthAdapter,
  permissions: await providerPermissionsForSession(),
});
```

The adapter must read an httpOnly, secure, sameSite session and return a validated `Session`. Do not put access tokens in localStorage or expose provider secrets to client components.

## Data

Implement `UserRepository` and `RoleRepository` from `@repo/data-access` using the chosen ORM/database. Validate inputs with the existing Zod schemas and parameterize every query. Register both adapters with `configureUserRepository` and `configureRoleRepository` during server composition.

The in-memory repositories are only for local demo/test mode. They are not durable, multi-instance safe, or suitable for PII.

## Deployment gate

- `GET /api/health` is liveness.
- `GET /api/health/ready` is readiness. It returns `503` until real auth and data adapters are registered in production.
- Run `pnpm verify` after connecting providers, then verify authenticated browser flows and database read/write behavior separately.
