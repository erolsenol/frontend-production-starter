# ADR-0001: Contract-first pnpm/Turborepo monorepo

## Status

Accepted

## Date

2026-09-22

## Context

The starter must serve both a small Next.js application and a richer admin product. Copying application code between those paths would make the starter easy to begin with but expensive to maintain. Shared code also needs to stay usable by future apps and frameworks.

## Decision

Use a pnpm workspace orchestrated by Turborepo. Keep reusable contracts and capabilities in `packages/*`; keep routing, composition, and product features in `apps/*`; keep an intentionally small onboarding path in `examples/*`.

## Alternatives considered

- **Single application:** simpler initially, but encourages feature code and reusable contracts to become inseparable.
- **Independent repositories:** stronger isolation, but poor onboarding and duplicated release/test setup for a starter.
- **Shared UI only:** leaves auth, data, validation, and observability contracts duplicated across applications.

## Consequences

Contributors must respect dependency direction and workspace scripts. The structure adds a small amount of package ceremony, but makes the reusable boundary visible and testable.
