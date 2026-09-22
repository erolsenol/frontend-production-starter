# Frontend Production Starter

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)
![Turborepo](https://img.shields.io/badge/monorepo-Turborepo-EF4444?logo=turborepo)
[![CI](https://github.com/erolsenol/frontend-production-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/erolsenol/frontend-production-starter/actions/workflows/ci.yml)

A public, production-minded admin starter for building typed, accessible, and maintainable web products with Next.js and TypeScript.

## Choose your path

- **Simple app:** start with `examples/minimal-next-app`.
- **Admin product:** explore `apps/admin`.
- **Package development:** read `docs/architecture.md` and the package READMEs.

## What is included

- Next.js App Router with Server Components by default
- TypeScript strict mode
- Turborepo + pnpm workspace
- Feature-oriented admin architecture
- Shared UI package with accessible primitives
- Typed contracts, validators, API client and permissions packages
- Roles & Permissions reference slice with protected CRUD API and permission-aware UI
- Mock-first dashboard, users, roles, audit logs and settings flows
- Minimal Next.js example and local documentation app
- Optional auth, permissions, i18n, feature flags, logging and testing packages
- Responsive dark-sidebar admin shell
- CI-ready ESLint, typecheck, unit test, E2E smoke test, security audit and build commands
- Safe default security headers and a replaceable HTTP client with timeout support

## Quick start

```bash
fnm use || nvm use
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the admin app. The minimal example runs on `3001`; docs run on `3002`.

## Workspace

```text
apps/admin              Next.js admin application
apps/docs               Local package and usage documentation
examples/minimal-next-app  Five-minute onboarding example
packages/ui             Shared UI primitives
packages/layout         Page header and layout primitives
packages/types          Framework-agnostic shared types
packages/contracts      Framework-agnostic domain contracts
packages/http           Typed HTTP client and error boundary
packages/data-access    Typed repository contracts and in-memory adapter
packages/validation     Runtime validation schemas
packages/forms          Form submission state contracts
packages/tables         Data table contracts
packages/permissions    RBAC permission model
packages/design-tokens  Shared visual tokens
packages/database       Drizzle PostgreSQL/Neon schema and repositories
packages/rate-limit-upstash  Optional distributed rate-limit adapter
packages/observability  OpenTelemetry trace/metric boundary
```

## Commands

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm coverage
pnpm build
pnpm check:full
pnpm e2e
pnpm audit
pnpm verify
```

Install the Playwright browser once before running E2E tests locally:

```bash
pnpm exec playwright install chromium
```

The starter is intentionally demo-first. `apps/admin` is a reference application with an included production composition: Better Auth + Drizzle + PostgreSQL/Neon, database-backed RBAC, audit logs, auth/mutation rate limiting, and an OpenTelemetry boundary. Demo auth is enabled outside production; runtime configuration rejects demo auth and memory data sources in production. `GET /api/health` is liveness; `GET /api/health/ready` validates production configuration and performs a lightweight database connectivity probe. Mutation routes add request correlation, same-origin protection, audit events, and distributed rate limiting. Run `pnpm verify` before publishing a change.

## Architecture

The application uses a replaceable adapter boundary: the demo runs with local mock data, while a real API can be introduced without rewriting feature components. Shared packages do not depend on the admin app, and business features do not leak into `@repo/ui`.

See [docs/architecture.md](./docs/architecture.md) and [CONTRIBUTING.md](./CONTRIBUTING.md).

For connecting a real authentication provider and database, see [docs/production-adapters.md](./docs/production-adapters.md).

## License

MIT. See [LICENSE](./LICENSE).
