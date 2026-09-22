# AI release playbook

Use this checklist when the user asks to publish a public change.

1. Inspect status, branch, remote, current version, changelog, and existing release/tag conventions.
2. Confirm the implementation and documentation are complete; do not include unrelated untracked or user-owned files.
3. Run `pnpm verify` and record the exact result. Resolve failures before release.
4. Review the diff for secrets, generated artifacts, stale docs, accidental provider claims, and breaking changes.
5. Update the version and `CHANGELOG.md` when the repository's release convention requires it.
6. Commit only the scoped files with a descriptive message.
7. Push the intended branch, create the matching tag/release if requested, and verify remote CI/release evidence.

Completion requires both local verification and remote publication evidence. A local commit is not a public release.
