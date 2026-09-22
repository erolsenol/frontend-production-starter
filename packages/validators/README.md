# `@repo/validators`

Zod schemas for runtime input validation at API and repository boundaries.

Parse untrusted input once at the boundary, then pass the inferred strict type inward. Keep validation errors explicit and preserve the app’s typed error response shape.
