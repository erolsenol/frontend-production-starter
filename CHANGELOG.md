# Changelog

## 0.5.0

- Added the Users invite and delete workflow with search, status filters, pagination, notifications, and E2E coverage.
- Connected the admin app to shared form and notification contracts.
- Published the `v0.5.0` public release.

## 0.4.1

- Upgraded Turborepo to 2.11.2 and removed the pnpm lockfile workspace warning.
- Added `@repo/data-access` with typed user repository contracts and an in-memory adapter.
- Added static auth adapter and session expiry checks with tests.
- Restored frozen-lockfile consistency and aligned root package metadata.

## 0.4.0

- Added coverage thresholds for the shared HTTP client and admin filtering helper.
- Added a public release workflow with quality, audit, and browser smoke gates.
- Improved onboarding metadata and production hardening defaults.

## 0.3.0

- Added ESLint, Playwright smoke tests, security headers, error UI, and HTTP timeout support.
