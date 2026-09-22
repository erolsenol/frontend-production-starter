# Vercel

1. Create a Vercel project from this repository.
2. Set Root Directory to `apps/admin` and keep the repository install command as `pnpm install --frozen-lockfile` from the monorepo root when prompted.
3. Configure the server-only values from [`.env.example`](../../.env.example): Better Auth, PostgreSQL/Neon, Upstash, and optional email/OTLP.
4. Deploy a preview first and verify `/api/health/ready`.
5. Run `PRODUCTION_E2E_URL=https://preview.example.com pnpm e2e:production` from a controlled environment.

The Vercel project must use Node 22 and the repository’s pnpm 12.4.2 package manager. Never add secrets to `NEXT_PUBLIC_*` variables.
