import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  experimental: {
    cssChunking: 'strict', // only load CSS actually needed by the current page
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};
export default nextConfig;
