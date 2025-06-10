import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Attempt to disable Next.js development indicators like the build activity indicator.
  devIndicators: {
    buildActivity: false,
    // You could also try disabling autoPrerender indicator if it's a lightning bolt:
    // autoPrerender: false, 
  },
};

export default nextConfig;
