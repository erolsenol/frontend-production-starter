# Testing guide

The test suite is layered so a contributor can get fast feedback before running the full release gate.

## Feedback ladder

| Change | First command | Completion evidence |
| --- | --- | --- |
| Pure package or utility | `pnpm --filter <workspace> test` | focused tests pass |
| Type or package boundary | `pnpm typecheck` | every workspace task passes |
| UI or route behavior | `pnpm --filter @repo/admin test` | route/component tests pass |
| Cross-app browser flow | `pnpm e2e` | Playwright smoke tests pass |
| Public release | `pnpm verify` | all quality, coverage, build, E2E, and audit gates pass |

## Test placement

- Put unit and contract tests beside the implementation as `*.test.ts` or `*.test.tsx`.
- Put browser journeys in `tests/e2e/` and keep them focused on user-visible behavior.
- Test both authorization branches for protected mutations: allowed and denied.
- Test production configuration failure paths, not only happy-path demo mode.
- Keep external providers behind adapters; provider integration tests must not make the default local suite depend on credentials.

## Local E2E

Install Chromium once, then run:

```bash
pnpm exec playwright install chromium
CI=1 pnpm e2e --workers=1
```

Playwright starts the admin, minimal example, and docs apps from the workspace configuration. A passing local E2E run proves browser behavior against the local composition; it does not prove an authenticated external provider or a public deployment.

## Production E2E

The separate production profile is opt-in and never runs against a guessed or local target:

```bash
PRODUCTION_E2E_URL=https://admin.example.com pnpm e2e:production
```

It verifies public recovery pages and the deployed readiness endpoint. Add credentialed login/RBAC journeys only through a controlled CI environment with dedicated test data.

## Accessibility and visual smoke

The default browser suite runs an axe scan for critical/serious dashboard violations and a deterministic docs landing screenshot smoke. The smoke asserts that the stable visual regions render and produce a non-empty screenshot without tying CI to OS-specific font rasterization.

## Coverage and audit

```bash
pnpm coverage
pnpm audit --prod --audit-level=high
```

Coverage thresholds are enforced by workspace scripts. The dependency audit is a release signal; review moderate findings separately when the command exits successfully at the configured high threshold.

## PostgreSQL integration

The database integration smoke is opt-in and only reads a dedicated target. It intentionally uses `INTEGRATION_DATABASE_URL` rather than `DATABASE_URL` to reduce the chance of probing or mutating the wrong environment:

```bash
INTEGRATION_DATABASE_URL=postgres://starter:starter@localhost:5432/frontend_production_starter pnpm test:integration
```

Apply reviewed migrations first with the same dedicated target. The default workspace test remains credential-free and reports the integration test as skipped when the variable is absent.
