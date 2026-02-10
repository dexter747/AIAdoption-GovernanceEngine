/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['shared'],
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
