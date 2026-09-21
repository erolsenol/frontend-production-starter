# Implementation Plan: General Starter Kit

## Objective

Turn the repository into a simple, reusable Next.js and TypeScript starter kit with a minimal path, a dashboard reference app, shared packages, documented adapters, tests, and public-template readiness.

## Architecture decisions

- `examples/minimal-next-app` is the easiest onboarding path.
- `apps/admin` remains the advanced reference application.
- Core packages stay framework-light; auth, permissions, i18n, and flags remain optional capabilities.
- Mock adapters are the default so the repository works without a database or provider account.
- Feature work is vertical: contract, validation, adapter, UI, and tests evolve together.

## Phases

1. Core package boundaries and minimal example
2. Shared UI/layout/data/form/table capabilities
3. Optional auth, permissions, i18n, and feature flags
4. Dashboard and CRUD examples
5. Docs, generators, contributor workflow, and release hardening

## Verification

Every phase must pass `pnpm check:full`; the admin and example apps must also pass browser smoke checks at desktop and mobile widths.
