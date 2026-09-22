# `@repo/config`

Runtime environment parsing with production fail-closed validation.

```ts
import { getAppConfig } from "@repo/config";

const config = getAppConfig(process.env);
```

Keep secrets server-side. Add required provider variables to the server composition or readiness check, not to `NEXT_PUBLIC_*`.
