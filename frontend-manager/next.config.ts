import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },

  images: {
    remotePatterns: [{ hostname: 'images.pexels.com' }],
  },
};

export default nextConfig;
