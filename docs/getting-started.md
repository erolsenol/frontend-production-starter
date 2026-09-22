# Getting started

## Prerequisites

- Node.js 22
- pnpm 12.4.2
- Chromium for browser tests: `pnpm exec playwright install chromium`

The repository pins the package manager in `package.json`. Use `fnm` or `nvm` to select Node 22 before installing dependencies.

## Five-minute path

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open:

- `http://localhost:3000` — admin reference app
- `http://localhost:3001` — minimal Next.js example
- `http://localhost:3002` — local docs app

The default environment is local demo mode: in-memory data, demo authentication, no external provider credentials. It is designed for learning and UI exploration, not for storing real user data.

## Choose a starting point

Use `examples/minimal-next-app` when the product needs a clean Next.js shell. Use `apps/admin` when it already needs an authenticated admin surface, roles, user management, audit logs, or the production adapter composition.

When extracting a capability, keep the stable contract in `packages/*` and the product-specific orchestration in an app or feature folder. Do not copy demo arrays into a new feature.

## Daily loop

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Use `pnpm --filter <workspace> <script>` while iterating on one package. Run `pnpm verify` before opening a release-worthy pull request.

## Environment modes

| Mode | Auth | Data | Use |
| --- | --- | --- | --- |
| Local default | `demo` | `memory` | UI work, onboarding, tests |
| Production reference | `better-auth` | `postgres` | real deployment after provider setup |

Production configuration is intentionally fail-closed. See [Operations](./operations.md) for the required variables and proof gates.
