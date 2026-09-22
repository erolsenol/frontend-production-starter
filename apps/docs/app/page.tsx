import Link from "next/link";

const packages = [
  { name: "@repo/ui", description: "Accessible, reusable UI primitives." },
  { name: "@repo/contracts", description: "Framework-light domain contracts and shared vocabulary." },
  { name: "@repo/data-access", description: "Repository contracts and disposable reference adapters." },
  { name: "@repo/database", description: "Drizzle PostgreSQL/Neon schema and repositories." },
  { name: "@repo/auth", description: "Provider-neutral sessions with Better Auth composition." },
  { name: "@repo/email", description: "Typed verification and password-reset delivery boundary." },
  { name: "@repo/observability", description: "OpenTelemetry instruments with optional OTLP runtime." },
];

const links = [
  ["Getting started", "https://github.com/erolsenol/frontend-production-starter/blob/main/docs/getting-started.md"],
  ["Architecture", "https://github.com/erolsenol/frontend-production-starter/blob/main/docs/architecture.md"],
  ["Operations", "https://github.com/erolsenol/frontend-production-starter/blob/main/docs/operations.md"],
  ["AI contributor docs", "https://github.com/erolsenol/frontend-production-starter/blob/main/docs/ai/README.md"],
] as const;

export default function DocsPage() {
  return <main className="docs"><header><span className="docs-logo">F</span><strong>Frontend Production Starter</strong><nav><Link href="/">Docs</Link><Link href="https://github.com/erolsenol/frontend-production-starter">GitHub ↗</Link></nav></header><section className="docs-hero"><p>DOCUMENTATION</p><h1>Build your next app on a clear foundation.</h1><span>Simple defaults for Next.js teams, with reusable packages when your product grows.</span></section><section className="docs-grid"><article><h2>Quick start</h2><pre><code>{"pnpm install\npnpm dev"}</code></pre><p>The admin app runs on port 3000, the minimal example on 3001, and docs on 3002.</p></article><article><h2>Choose your path</h2><ul><li><Link href="http://localhost:3001">Minimal example</Link><span>Start small with the essentials.</span></li><li><Link href="http://localhost:3000">Admin example</Link><span>Explore the complete reference app.</span></li></ul></article></section><section className="package-section"><h2>Packages</h2><div className="package-grid">{packages.map((item) => <article key={item.name}><code>{item.name}</code><p>{item.description}</p></article>)}</div></section><section className="docs-grid docs-next"><article><h2>Read next</h2><ul>{links.map(([label, href]) => <li key={href}><Link href={href}>{label} ↗</Link></li>)}</ul></article><article><h2>Production checklist</h2><ul><li><strong>Auth:</strong><span>Use a server-side adapter and verify recovery flows.</span></li><li><strong>Data:</strong><span>Use typed repositories, SQL pagination, and migrations.</span></li><li><strong>Quality:</strong><span>Run lint, typecheck, tests, coverage, build, E2E, and audit.</span></li></ul></article></section></main>;
}
