import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'assets.sainsburys-groceries.co.uk' },
      { protocol: 'https', hostname: 'images.immediate.co.uk' },
      { protocol: 'https', hostname: '**.bbcgoodfood.com' },
      { protocol: 'https', hostname: '**.jamieoliver.com' },
    ],
  },
};

export default nextConfig;
