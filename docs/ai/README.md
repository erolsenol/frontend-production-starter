# AI contributor guide

AI agents should treat this repository as a contract-first starter, not as a collection of screens to copy. Read the root [`AGENTS.md`](../../AGENTS.md), then choose the smallest task guide that matches the work.

## Task routing

| Task | Guide |
| --- | --- |
| Add a feature or package | [Implementation playbook](./implementation-playbook.md) |
| Review a change | [Review playbook](./review-playbook.md) |
| Test or debug a failure | [Verification playbook](./verification-playbook.md) |
| Prepare a public release | [Release playbook](./release-playbook.md) |

## Working contract

Before editing, inspect `git status`, the nearest package/app manifest, existing tests, and the relevant architecture/ADR docs. Preserve unrelated user changes. Prefer a small vertical slice and verify it before expanding scope.

The environment and source code are authoritative for exact scripts, exports, and route names. These guides encode reasoning, boundaries, and completion criteria that are not obvious from a file listing.
