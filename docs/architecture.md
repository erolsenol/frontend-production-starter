# Architecture

`apps/admin` owns routing, page composition, and product-specific features. Shared packages own stable contracts and reusable capabilities.

```text
page / server component
        ↓
feature query or action
        ↓
repository / API adapter
        ↓
contracts + validators
```

Dependency rules:

- `@repo/contracts` has no UI or Next.js dependency.
- `@repo/ui` contains presentation only.
- `@repo/api-client` does not import the admin app.
- Features may consume shared packages; shared packages must not import features.
- Permission checks happen in both rendered actions and mutation boundaries.
