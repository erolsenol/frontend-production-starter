import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const [, , command, name] = process.argv;
const safeName = typeof name === "string" ? name.trim().replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase() : "";

if (!command || !safeName || !["feature", "page", "package"].includes(command)) {
  console.error("Usage: pnpm generate <feature|page|package> <name>");
  process.exit(1);
}

const root = resolve(process.cwd());
const files = command === "feature"
  ? { [`apps/admin/features/${safeName}/index.ts`]: `export interface ${safeName[0].toUpperCase()}${safeName.slice(1)}Feature { readonly name: string; }\n` }
  : command === "page"
    ? { [`apps/admin/app/${safeName}/page.tsx`]: `export default function ${safeName[0].toUpperCase()}${safeName.slice(1)}Page() { return <main><h1>${safeName}</h1></main>; }\n` }
    : { [`packages/${safeName}/README.md`]: `# @repo/${safeName}\n\nDescribe the responsibility and public API of this package.\n` };

for (const [relativePath, content] of Object.entries(files)) {
  const filePath = resolve(root, relativePath);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
  console.log(`Created ${relativePath}`);
}
