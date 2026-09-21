# Frontend Production Starter

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)
![Turborepo](https://img.shields.io/badge/monorepo-Turborepo-EF4444?logo=turborepo)

A public, production-minded admin starter for building typed, accessible, and maintainable web products with Next.js and TypeScript.

## What is included

- Next.js App Router with Server Components by default
- TypeScript strict mode
- Turborepo + pnpm workspace
- Feature-oriented admin architecture
- Shared UI package with accessible primitives
- Typed contracts, validators, API client and permissions packages
- Mock-first dashboard, users, roles, audit logs and settings flows
- Responsive dark-sidebar admin shell
- CI-ready lint, typecheck, test and build commands

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Workspace

```text
apps/admin              Next.js admin application
packages/ui             Shared UI primitives
packages/contracts      Framework-agnostic domain contracts
packages/validators     Runtime validation schemas
packages/api-client     Typed API and mock adapter boundary
packages/permissions    RBAC permission model
packages/design-tokens  Shared visual tokens
```

## Commands

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check:full
```

## Architecture

The application uses a replaceable adapter boundary: the demo runs with local mock data, while a real API can be introduced without rewriting feature components. Shared packages do not depend on the admin app, and business features do not leak into `@repo/ui`.

See [docs/architecture.md](./docs/architecture.md) and [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT. See [LICENSE](./LICENSE).
