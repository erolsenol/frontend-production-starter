# AI implementation playbook

Use this sequence for a feature or refactor.

1. **Frame the slice.** State the user-visible behavior, affected app/package, and non-goals. Search for an existing contract or adapter before adding one.
2. **Trace the boundary.** Decide whether the change belongs in a framework-light package, an app composition layer, a feature, or a route. Keep provider SDKs at the server edge.
3. **Implement the contract first.** Add strict types and runtime validation for external input. Keep errors explicit and preserve the existing response/error shape.
4. **Wire one path end to end.** Connect adapter/repository, authorization, route/action, UI, and loading/error states. Use the existing provider-neutral interfaces.
5. **Test the branches.** Cover happy path, invalid input, unauthorized access, provider/configuration failure, and any pagination or empty-state boundary introduced by the change.
6. **Update the right docs.** Change the nearest guide for new behavior; add an ADR for an expensive-to-reverse decision; update `CHANGELOG.md` for a release-visible change.
7. **Verify and report.** Run the narrowest checks first, then the relevant full gate. Report exact commands and pass/fail evidence.

Completion means the slice is typed, validated, authorized, tested, documented, and connected to the real boundary it claims to support.

## Common choices

- New reusable type or validation: `packages/contracts`, `packages/types`, or `packages/validators`.
- New UI primitive: `packages/ui`; product behavior stays in an app feature.
- New external integration: define a provider-neutral interface, then add the server-side adapter and configuration validation.
- New CRUD area: follow the Roles & Permissions vertical slice and preserve request IDs, audit events, same-origin checks, and rate limiting on mutations.
