# ADR-0003: PostgreSQL, database RBAC, and durable audit

## Status

Accepted

## Date

2026-09-22

## Context

An admin starter needs relational users, roles, permissions, and audit events. Permission changes must apply across instances, and mutations need a durable record with actor and request correlation.

## Decision

Use PostgreSQL through Drizzle for the production reference. Resolve permissions from `user_role` and `role_permission` for the authenticated user. Persist audit events with actor, resource, request ID, and redacted context. Keep filtering and pagination in SQL and use transactions for multi-table user/role writes.

## Alternatives considered

- **Static permission lists:** simple, but stale across sessions and instances.
- **In-memory RBAC:** useful for demo mode, not durable or safe for production.
- **Document database:** possible, but the role/permission/audit relationships and transactional mutations are naturally relational.

## Consequences

Production needs migrations and a real database. The demo remains fast because it uses the same repository contracts with disposable adapters. Authorization must be tested at both UI and API mutation boundaries.
