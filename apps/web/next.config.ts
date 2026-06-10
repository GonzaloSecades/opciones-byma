import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@opciones/core", "@opciones/data"],
};

export default nextConfig;
