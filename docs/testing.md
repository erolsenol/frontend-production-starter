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

## Coverage and audit

```bash
pnpm coverage
pnpm audit --prod --audit-level=high
```

Coverage thresholds are enforced by workspace scripts. The dependency audit is a release signal; review moderate findings separately when the command exits successfully at the configured high threshold.
