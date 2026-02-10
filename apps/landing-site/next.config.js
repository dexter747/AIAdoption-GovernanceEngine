/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['shared'],
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  outputFileTracingRoot: require('path').join(__dirname, '../../'),
};

export default nextConfig;
