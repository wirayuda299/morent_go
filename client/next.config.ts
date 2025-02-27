import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**/*',
      },
    ],
  },
  env: {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    SIGNING_SECRET: process.env.SIGNING_SECRET,
  },
  serverExternalPackages: ['pino', 'pino-pretty'],
};

export default nextConfig;
