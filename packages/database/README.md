# `@repo/database`

Provider-backed PostgreSQL foundation for the production template.

```bash
DATABASE_URL=postgres://... pnpm --filter @repo/database db:generate
DATABASE_URL=postgres://... pnpm --filter @repo/database db:migrate
```

The schema contains Better Auth core tables (`user`, `session`, `account`, `verification`), RBAC tables, and `audit_log`. Runtime code creates a Neon HTTP Drizzle client lazily through `createNeonDatabase`; no connection is opened during import or local demo startup.

Keep `DATABASE_URL` server-side. Use separate local, preview, and production databases and review generated migrations before applying them.
