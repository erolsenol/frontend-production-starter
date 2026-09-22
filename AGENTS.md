# Contribution contract

This repository is a public Next.js/TypeScript starter. Keep changes small, typed, testable, and easy for a new contributor to understand.

## Start here

- Read `docs/README.md` for the documentation map.
- Read `docs/architecture.md` before changing package boundaries or application composition.
- Read `docs/operations.md` before changing environment variables, database, auth, rate limiting, email, telemetry, or deployment behavior.
- Read the matching `docs/ai/*.md` guide when an AI agent is implementing, reviewing, testing, or releasing a change.
- Read the relevant ADR in `docs/decisions/` before revisiting an established architectural choice.

## Repository rules

- Keep `apps/*` responsible for routing, composition, and product-specific features.
- Keep `packages/*` framework-light and reusable; packages must not import from an app or feature.
- Keep public contracts and runtime validation together. Prefer `unknown` plus narrowing over `any`.
- Use Server Components by default. Put client state at the leaves and keep provider SDKs server-side.
- Enforce permissions at both the UI boundary and the mutation/API boundary.
- Keep demo auth and memory data local-only. Production must use explicit providers and fail closed when configuration is incomplete.
- Redact secrets and personal data from logs, audit context, telemetry attributes, and examples.
- Add or update tests and documentation for behavior that crosses a package or public API boundary.

## Verification

Run the narrowest relevant check while iterating. Before a public release, run `pnpm verify` from the repository root. The command is the completion gate: lint, typecheck, unit tests, coverage, build, browser smoke tests, and production dependency audit must pass.

When a check fails, fix the underlying contract or configuration. Do not weaken a test, skip a hook, or claim provider/deployment behavior from a local mock or static build.

## Change shape

Prefer a vertical slice: contract → validation → adapter/repository → UI → tests → docs. Update `CHANGELOG.md` for user-visible releases and add an ADR when the change makes a decision that is expensive to reverse.
