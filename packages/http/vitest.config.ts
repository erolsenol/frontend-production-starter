import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/index.ts"],
      thresholds: { lines: 70, functions: 75, branches: 50, statements: 70 },
    },
  },
});
