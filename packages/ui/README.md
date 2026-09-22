# `@repo/ui`

Accessible, presentation-only UI primitives. Keep domain logic and data fetching outside this package.

```tsx
import { Button, Card, ConfirmDialog, Dialog } from "@repo/ui";
```

`Dialog` and `ConfirmDialog` manage keyboard dismissal and initial focus. Keep domain state and submit behavior in the consuming app.
