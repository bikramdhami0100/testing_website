import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["lighthouse", "@paulirish/trace_engine", "autocannon", "playwright", "chrome-launcher", "html-validate", "supertest", "axe-core", "@puppeteer/browsers"],

};

export default nextConfig;
