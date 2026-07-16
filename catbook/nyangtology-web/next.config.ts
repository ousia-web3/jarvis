import type { NextConfig } from 'next';

const isAppsInTossStaticExport =
  process.env.AIT_STATIC_EXPORT === '1' ||
  process.env.npm_lifecycle_event === 'ait:build';

const nextConfig: NextConfig = {
  ...(isAppsInTossStaticExport ? { output: 'export' as const } : {}),
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    ...(isAppsInTossStaticExport ? { unoptimized: true } : {}),
    deviceSizes: [360, 414, 640, 768, 1024, 1280],
    imageSizes: [48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },
};

export default nextConfig;
