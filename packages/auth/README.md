# `@repo/auth`

Authentication contracts, session expiry checks, server-side `requireSession`, and demo/static adapters. The package intentionally does not force a provider. Implement `AuthAdapter` for your chosen auth system and call `requireSession` at protected server boundaries. In the admin app, pass that adapter to `createAdminPermissionGuard` so authentication and RBAC remain replaceable without changing route handlers.

```ts
const auth = createStaticAuthAdapter(session);
const currentSession = await auth.getSession();
```
