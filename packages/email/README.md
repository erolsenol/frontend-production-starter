# `@repo/email`

Provider-neutral email delivery for Better Auth verification and password reset flows.

```ts
import type { EmailSender } from "@repo/email";

const sender: EmailSender = { send: async (message) => { /* server-side provider */ } };
```

Use `createEmailSenderFromEnv` at the server composition boundary. Never expose webhook tokens or provider credentials to client code.
