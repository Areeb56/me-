/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@aios/shared-types"],
  output: "standalone",
};

module.exports = nextConfig;
