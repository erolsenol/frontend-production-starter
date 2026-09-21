import type { NextConfig } from "next";

const nextConfig: NextConfig = { transpilePackages: ["@repo/ui", "@repo/contracts", "@repo/validators", "@repo/permissions"] };
export default nextConfig;
