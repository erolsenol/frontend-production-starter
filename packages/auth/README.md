# `@repo/auth`

Authentication contracts, session expiry checks, and demo/static adapters. The package intentionally does not force a provider. Implement `AuthAdapter` for your chosen auth system.

```ts
const auth = createStaticAuthAdapter(session);
const currentSession = await auth.getSession();
```
