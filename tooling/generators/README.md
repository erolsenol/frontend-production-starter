# Generators

The generator creates safe, minimal starting points. It never overwrites an existing file unless `--force` is explicit.

```bash
pnpm generate feature users
pnpm generate page settings
pnpm generate package analytics

# Intentional replacement of generated files
pnpm generate page settings --force
```

Use the smallest matching vertical feature slice and replace generated contracts with the real domain model.
