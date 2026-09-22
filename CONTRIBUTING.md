# Contributing

1. Read [`AGENTS.md`](./AGENTS.md), then [Getting started](./docs/getting-started.md) and the relevant architecture/operations guide.
2. Install Node.js 22 and pnpm 12.4.2, then run `pnpm install`.
3. Keep shared contracts framework-agnostic and keep provider SDKs at the server composition boundary.
4. Add tests for new behavior, including denied/configuration-failure branches where applicable.
5. Update the nearest docs page for public behavior and add an ADR for a decision that is expensive to reverse.
6. Run `pnpm check:full` while iterating and `pnpm verify` before a public release.

Prefer vertical feature slices: contract, validation, data adapter, UI, and tests should evolve together.
