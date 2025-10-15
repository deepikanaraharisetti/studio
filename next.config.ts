
import 'dotenv/config';
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // This allows cross-origin requests in development, which is needed for
    // the Firebase Studio environment.
    allowedDevOrigins: ["https://*.cluster-ubrd2huk7jh6otbgyei4h62ope.cloudworkstations.dev"],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'studio-1373398294-3404b.appspot.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
