# `@repo/rate-limit-upstash`

Distributed rate-limit adapter for production auth and mutation boundaries.

Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` server-side. Local demo mode may bypass this adapter; production should fail closed when it is required but unavailable.
