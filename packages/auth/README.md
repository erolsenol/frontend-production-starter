# `@repo/auth`

Authentication contracts, session expiry checks, server-side `requireSession`, and demo/static adapters. The package intentionally does not force a provider. Implement `AuthAdapter` for your chosen auth system and call `requireSession` at protected server boundaries.

```ts
const auth = createStaticAuthAdapter(session);
const currentSession = await auth.getSession();
```
