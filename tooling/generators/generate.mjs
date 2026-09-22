import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const [, , ...args] = process.argv;
const [command, name] = args;
const force = args.includes("--force");
const safeName = typeof name === "string" ? name.trim().replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase() : "";
const pascalName = safeName.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");

if (!command || !safeName || !["feature", "page", "package"].includes(command)) {
  console.error("Usage: pnpm generate <feature|page|package> <name> [--force]");
  process.exit(1);
}

const root = resolve(process.cwd());
const files = command === "feature"
  ? {
      [`apps/admin/features/${safeName}/index.ts`]: `export interface ${pascalName}Feature { readonly name: string; }\n`,
      [`apps/admin/features/${safeName}/README.md`]: `# ${pascalName}\n\nFeature boundary for ${safeName}. Keep data access and UI composition inside this feature.\n`,
    }
  : command === "page"
    ? { [`apps/admin/app/${safeName}/page.tsx`]: `import { Card } from "@repo/ui";\n\nexport default function ${pascalName}Page() { return <Card><h1>${safeName}</h1><p>Replace this reference page with a vertical feature slice.</p></Card>; }\n` }
    : {
        [`packages/${safeName}/package.json`]: JSON.stringify({ name: `@repo/${safeName}`, version: "0.1.0", private: true, main: "src/index.ts", types: "src/index.ts", scripts: { typecheck: "tsc --noEmit" }, devDependencies: { typescript: "^5.7.2" } }, null, 2) + "\n",
        [`packages/${safeName}/tsconfig.json`]: JSON.stringify({ extends: "../typescript-config/base.json", include: ["src"] }, null, 2) + "\n",
        [`packages/${safeName}/src/index.ts`]: `export interface ${pascalName}Package { readonly name: string; }\n`,
        [`packages/${safeName}/README.md`]: `# @repo/${safeName}\n\nDescribe the responsibility, public API, and adapter boundary of this package.\n`,
      };

for (const [relativePath, content] of Object.entries(files)) {
  const filePath = resolve(root, relativePath);
  if (!force) {
    try {
      await access(filePath);
      throw new Error(`${relativePath} already exists. Use --force only when replacing it intentionally.`);
    } catch (error) {
      if (error instanceof Error && !String(error.message).includes("ENOENT")) throw error;
    }
  }
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
  console.log(`Created ${relativePath}`);
}
