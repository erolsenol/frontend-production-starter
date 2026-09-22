# AI review playbook

Review changes in this order and report findings by severity with file and line references.

1. **Behavior:** Does the implementation satisfy the requested flow, including loading, empty, error, and unauthorized states?
2. **Boundary:** Do dependencies point inward from apps to packages? Are provider SDKs and secrets server-only? Is the public contract stable and validated?
3. **Security:** Are auth and permissions enforced at mutation boundaries? Are origins, rate limits, request IDs, audit redaction, and production fail-closed behavior preserved?
4. **Data:** Are queries parameterized, paginated in SQL, transactional where multiple tables change, and safe for multi-instance use?
5. **Quality:** Are strict types used without `any`? Are tests meaningful and deterministic? Does the change add stale duplication to docs or code?
6. **Release risk:** Do build, E2E, migrations, environment variables, and changelog/ADR requirements change?

Treat missing tests for a changed boundary as a finding, not as an optional follow-up. Separate confirmed findings from questions and from suggestions.
