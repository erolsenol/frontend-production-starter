# Production E2E

These tests are intentionally opt-in because they target an external deployment and may touch real auth, database, email, or rate-limit providers.

```bash
PRODUCTION_E2E_URL=https://admin.example.com pnpm e2e:production
```

The target must already have `DEMO_MODE=false`, Better Auth, PostgreSQL, and the readiness endpoint configured. A local E2E run does not replace this target-level evidence.
