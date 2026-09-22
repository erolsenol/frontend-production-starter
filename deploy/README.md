# Deployment examples

The repository keeps deployment examples explicit and provider-neutral. Choose one target, configure server-only variables, run the local quality gate, then verify readiness and production E2E against the deployed URL.

- [Vercel](./vercel/README.md) — recommended for the Next.js admin app.
- [Docker](./docker/README.md) — portable container and local PostgreSQL companion.

These examples deploy `apps/admin`. The minimal and docs apps remain useful as local onboarding surfaces and can be deployed separately with the same workspace pattern.
