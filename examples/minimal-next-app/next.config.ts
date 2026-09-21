import type { NextConfig } from "next";
const nextConfig: NextConfig = { transpilePackages: ["@repo/ui", "@repo/layout", "@repo/config"] };
export default nextConfig;
