# Changelog

## 0.11.0

- Added typed runtime configuration that rejects demo auth and in-memory data sources in production.
- Added structured logging with redaction for common secret fields and request correlation IDs.
- Added same-origin protection for admin mutations.
- Added a complete Roles & Permissions reference slice with canonical permission catalog, repository, protected API, validation, and create-role UI.
- Added regression coverage for production configuration, request context, role repository, and role APIs.

## 0.10.0

- Added a provider-ready admin permission guard factory for real authentication integrations.
- Hardened readiness semantics with dynamic, non-cacheable health responses.
- Fixed in-memory repository ID collisions after deleting middle records.
- Extracted the invitation dialog and moved validation to a native FormData plus Zod boundary.
- Added health, permission, repository identity, and invitation regression coverage.

## 0.9.0

- Refactored the Users screen around a focused `UserTable` feature component and the shared accessible Dialog primitive.
- Strengthened Dialog focus management with stable ids, focus restoration, Escape dismissal, and Tab containment.
- Extended the shared HTTP client with PATCH/DELETE methods and nested API error parsing.
- Centralized admin API validation, not-found, invalid-id, and no-content responses.

## 0.8.0

- Completed validated Users update and status CRUD across repository, API, typed client, UI, and E2E layers.
- Added production-safe demo authentication and permission boundaries with explicit denial when a real provider is not configured.
- Added safe feature, page, and package generators with overwrite protection and typed Users API adapter tests.

## 0.7.0

- Added reusable accessible `Dialog` and `ConfirmDialog` UI primitives.
- Replaced browser-native user deletion confirmation with a reusable destructive action dialog.
- Added provider-neutral `requireSession` and typed unauthenticated errors.
- Stabilized parallel E2E fixtures so destructive tests do not affect filtering tests.

## 0.6.0

- Added a validated Users API with list, invite, and delete operations backed by a replaceable repository contract.
- Moved the Users reference UI from local-only state to the API boundary with loading, error, empty, pagination, and response validation states.
- Added workspace-wide TypeScript checks for shared packages and fixed HTTP cancellation composition.
- Added typed permission enforcement and accessible invite-dialog keyboard behavior.

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
