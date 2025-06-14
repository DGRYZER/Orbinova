<<<<<<< HEAD

import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
=======
// import type {NextConfig} from 'next';
/**
 * @type {import('next').NextConfig}
 */

const nextConfig = {
>>>>>>> 4dad47e2bf19a5cfe0a46d24b505fba4ef12689a
  /* config options here */
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
<<<<<<< HEAD
    ignoreDuringBuilds: true,
=======
    ignoreDuringBuilds: true
>>>>>>> 4dad47e2bf19a5cfe0a46d24b505fba4ef12689a
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
<<<<<<< HEAD
};

export default nextConfig;
=======
  devIndicators: false,
};

module.exports = nextConfig;
>>>>>>> 4dad47e2bf19a5cfe0a46d24b505fba4ef12689a
