# Docker

Build and run the reference admin app from the repository root:

```bash
docker build -f deploy/docker/Dockerfile -t frontend-production-starter-admin .
docker run --rm -p 3000:3000 --env-file .env.production frontend-production-starter-admin
```

The image uses the workspace lockfile and runs the Next.js admin app. Set `HOSTNAME=0.0.0.0` when the platform does not provide it automatically.

For a local PostgreSQL companion:

```bash
docker compose -f deploy/docker/compose.postgres.yml up -d
DATABASE_URL=postgres://starter:starter@localhost:5432/frontend_production_starter pnpm db:migrate
```

Use a separate database for tests, previews, and production. Review the effective `DATABASE_URL` before applying migrations.
