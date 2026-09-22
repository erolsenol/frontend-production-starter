# AI verification playbook

Use a tight feedback loop and keep checks serial when they share the workspace or install state.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm coverage
CI=1 pnpm e2e --workers=1
pnpm audit --prod --audit-level=high
```

Use focused workspace commands first. Run `pnpm verify` for the final release gate. If a command fails, capture the first actionable error, inspect the implementation/configuration that caused it, fix the root cause, and rerun the smallest reproducer before the full gate.

State what the evidence proves. Unit tests prove code paths; E2E proves local browser behavior; a readiness response proves the target runtime can reach its configured dependencies. None of these alone proves a public deployment or a real authenticated provider unless that target was tested.
