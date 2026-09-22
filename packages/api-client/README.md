# `@repo/api-client`

Typed feature-facing API client contracts. Keep transport details here and keep domain decisions in the consuming feature.

```ts
import { createFetchClient } from "@repo/api-client";

const api = createFetchClient({ baseUrl: "/api" });
```

Use `@repo/http` for shared request/error behavior and validate response data at the feature boundary.
