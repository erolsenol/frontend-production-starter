# `@repo/data-access`

Typed repository boundaries for product data. The package includes an in-memory user repository for demos and tests; replace it with an HTTP, database, or provider-backed implementation without changing feature contracts.

```ts
const repository = new InMemoryUserRepository(users);
const result = await repository.list({ query: "sarah", status: "all", page: 1, pageSize: 20 });
```

The package also exposes `RoleRepository` and `InMemoryRoleRepository`. The reference adapter validates every permission against `@repo/permissions` and refuses mutations to system roles. Replace it with a database adapter behind the same contract before using real users.
