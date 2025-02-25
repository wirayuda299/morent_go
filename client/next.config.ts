import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**/*",
      },
    ],
  },
  env: {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    SIGNIN_SECRET: process.env.SIGNIN_SECRET,
  },
};

export default nextConfig;
