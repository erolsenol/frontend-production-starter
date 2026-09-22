# `@repo/auth`

Authentication contracts, session expiry checks, server-side `requireSession`, and demo/static adapters. The package intentionally does not force a provider. Implement `AuthAdapter` for your chosen auth system and call `requireSession` at protected server boundaries. In the admin app, pass that adapter to `createAdminPermissionGuard` so authentication and RBAC remain replaceable without changing route handlers.

```ts
const auth = createStaticAuthAdapter(session);
const currentSession = await auth.getSession();
```

`createBetterAuth` is the optional PostgreSQL-backed adapter. It requires a `NeonHttpDatabase` created by `@repo/database`, a server-only `BETTER_AUTH_SECRET` of at least 32 characters, and a trusted `baseURL`. Mount its handler in `/api/auth/[...all]`; never expose the database connection or secret to client code.
